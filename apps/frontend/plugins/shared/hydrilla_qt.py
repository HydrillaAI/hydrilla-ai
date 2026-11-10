"""Hydrilla panel for apps that ship Qt (Maya and 3ds Max).

The host app passes in a small adapter that knows how to import a GLB; the
panel handles the API key, generation, status and the Bridge. Network calls
run on worker threads and report back through Qt signals, so the host app's
own API is only ever used from its main thread.

Python 3.7+, PySide6 or PySide2 (whichever the host app ships).
"""

from __future__ import annotations

import os
import threading
import webbrowser
from typing import Any, Callable, Optional

try:
    from PySide6 import QtCore, QtWidgets
except ImportError:
    from PySide2 import QtCore, QtWidgets

try:
    from . import bridge_server
    from . import hydrilla_api as api
    from . import hydrilla_config as config
except ImportError:
    import bridge_server
    import hydrilla_api as api
    import hydrilla_config as config

BRIDGE_POLL_MS = 250
IMAGE_FILTER = "Images (*.png *.jpg *.jpeg *.webp)"


class HostAdapter:
    """What the panel needs from the app it runs in."""

    app = ""
    title = "Hydrilla"

    def import_glb(self, path: str, name: str) -> str:
        """Bring the GLB into the open scene. Return a short message for the user."""
        raise NotImplementedError

    def main_window(self) -> Optional[Any]:
        return None


class _Signals(QtCore.QObject):
    status = QtCore.Signal(str, int)
    account = QtCore.Signal(str, str)
    finished = QtCore.Signal(str, str)
    failed = QtCore.Signal(str, str)


class HydrillaPanel(QtWidgets.QWidget):
    def __init__(self, host: HostAdapter, parent: Optional[Any] = None):
        super().__init__(parent)
        self.host = host
        self.setWindowTitle(host.title)
        self.setWindowFlags(self.windowFlags() | QtCore.Qt.Window)
        self.setMinimumWidth(360)

        self._busy = False
        self._cancel = False
        self._checked_key = ""
        self._signals = _Signals()
        self._signals.status.connect(self._on_status)
        self._signals.account.connect(self._on_account)
        self._signals.finished.connect(self._on_finished)
        self._signals.failed.connect(self._on_failed)

        self._bridge = bridge_server.Bridge(host.app)
        self._bridge_timer = QtCore.QTimer(self)
        self._bridge_timer.setInterval(BRIDGE_POLL_MS)
        self._bridge_timer.timeout.connect(self._drain_bridge)

        self._build()
        self._load_key()

    # ---- layout ---------------------------------------------------------

    def _build(self) -> None:
        root = QtWidgets.QVBoxLayout(self)

        account = QtWidgets.QGroupBox("Account")
        account_layout = QtWidgets.QVBoxLayout(account)
        self.account_label = QtWidgets.QLabel("Add your API key to start")
        self.account_label.setWordWrap(True)
        self.key_field = QtWidgets.QLineEdit()
        self.key_field.setEchoMode(QtWidgets.QLineEdit.Password)
        self.key_field.setPlaceholderText("hyd_live_…")
        self.key_field.editingFinished.connect(self._key_edited)
        key_row = QtWidgets.QHBoxLayout()
        get_key = QtWidgets.QPushButton("Get API key")
        get_key.clicked.connect(lambda: webbrowser.open(config.api_keys_url()))
        check = QtWidgets.QPushButton("Check")
        check.clicked.connect(self._save_key)
        remove = QtWidgets.QPushButton("Remove")
        remove.clicked.connect(self._remove_key)
        for button in (get_key, check, remove):
            key_row.addWidget(button)
        account_layout.addWidget(self.account_label)
        account_layout.addWidget(self.key_field)
        account_layout.addLayout(key_row)
        root.addWidget(account)

        generate = QtWidgets.QGroupBox("Generate")
        generate_layout = QtWidgets.QVBoxLayout(generate)
        self.prompt_field = QtWidgets.QLineEdit()
        self.prompt_field.setPlaceholderText("Describe the model you want")
        self.text_button = QtWidgets.QPushButton("Generate from text")
        self.text_button.clicked.connect(self._generate_text)
        image_row = QtWidgets.QHBoxLayout()
        self.image_field = QtWidgets.QLineEdit()
        self.image_field.setPlaceholderText("Image file or https:// link")
        browse = QtWidgets.QPushButton("Browse…")
        browse.clicked.connect(self._browse_image)
        image_row.addWidget(self.image_field)
        image_row.addWidget(browse)
        self.image_button = QtWidgets.QPushButton("Generate from image")
        self.image_button.clicked.connect(self._generate_image)
        self.progress = QtWidgets.QProgressBar()
        self.progress.setRange(0, 100)
        self.progress.setVisible(False)
        self.status_label = QtWidgets.QLabel("Ready")
        self.status_label.setWordWrap(True)
        self.cancel_button = QtWidgets.QPushButton("Cancel")
        self.cancel_button.setVisible(False)
        self.cancel_button.clicked.connect(self._request_cancel)
        generate_layout.addWidget(self.prompt_field)
        generate_layout.addWidget(self.text_button)
        generate_layout.addLayout(image_row)
        generate_layout.addWidget(self.image_button)
        generate_layout.addWidget(self.progress)
        generate_layout.addWidget(self.status_label)
        generate_layout.addWidget(self.cancel_button)
        root.addWidget(generate)

        bridge = QtWidgets.QGroupBox("Bridge")
        bridge_layout = QtWidgets.QVBoxLayout(bridge)
        self.bridge_button = QtWidgets.QPushButton("Run Bridge")
        self.bridge_button.setCheckable(True)
        self.bridge_button.clicked.connect(self._toggle_bridge)
        self.bridge_label = QtWidgets.QLabel(
            "Lets Hydrilla Studio and your AI agent send models here."
        )
        self.bridge_label.setWordWrap(True)
        bridge_layout.addWidget(self.bridge_button)
        bridge_layout.addWidget(self.bridge_label)
        root.addWidget(bridge)
        root.addStretch(1)

    # ---- account --------------------------------------------------------

    def _client(self) -> api.HydrillaClient:
        return api.HydrillaClient(self.key_field.text())

    def _load_key(self) -> None:
        stored = config.stored_api_key()
        if stored:
            self.key_field.setText(stored)
            self._checked_key = stored
        if config.resolve_api_key(stored):
            self._verify()

    def _key_edited(self) -> None:
        # Leaving the field without changing it should not call the API again.
        if config.clean_api_key(self.key_field.text()) != self._checked_key:
            self._save_key()

    def _save_key(self) -> None:
        cleaned = config.clean_api_key(self.key_field.text())
        if cleaned != self.key_field.text():
            self.key_field.setText(cleaned)
        self._checked_key = cleaned
        if cleaned and not config.looks_like_api_key(cleaned):
            self.account_label.setText("That does not look like a Hydrilla key (hyd_live_…).")
            return
        if cleaned != config.stored_api_key():
            try:
                config.save_api_key(cleaned)
            except OSError as error:
                self.account_label.setText("Could not save the key: %s" % error)
                return
        if config.resolve_api_key(cleaned):
            self._verify()
        else:
            self.account_label.setText("Add your API key to start")

    def _remove_key(self) -> None:
        self.key_field.setText("")
        self._checked_key = ""
        try:
            config.save_api_key("")
        except OSError as error:
            self.account_label.setText("Could not remove the key: %s" % error)
            return
        self.account_label.setText("API key removed from this computer.")

    def _verify(self) -> None:
        client = self._client()
        self.account_label.setText("Checking your key…")

        def worker() -> None:
            try:
                remaining = client.credits_remaining()
                text = "Connected" if remaining is None else "Connected · %d credits" % remaining
                self._signals.account.emit("ok", text)
            except Exception as error:
                self._signals.account.emit("error", str(error))

        threading.Thread(target=worker, name="hydrilla-verify", daemon=True).start()

    def _on_account(self, _state: str, text: str) -> None:
        self.account_label.setText(text)

    # ---- generation -----------------------------------------------------

    def _set_busy(self, busy: bool) -> None:
        self._busy = busy
        self.text_button.setEnabled(not busy)
        self.image_button.setEnabled(not busy)
        self.progress.setVisible(busy)
        self.cancel_button.setVisible(busy)
        self.cancel_button.setEnabled(busy)

    def _generate_text(self) -> None:
        prompt = self.prompt_field.text().strip()
        if not prompt:
            self.status_label.setText("Enter a prompt.")
            return
        self._run(lambda client, report, cancelled: api.generate_and_download(
            client, prompt=prompt, on_status=report, should_cancel=cancelled
        ), prompt[:24])

    def _browse_image(self) -> None:
        path, _selected = QtWidgets.QFileDialog.getOpenFileName(self, "Choose image", "", IMAGE_FILTER)
        if path:
            self.image_field.setText(path)

    def _generate_image(self) -> None:
        source = self.image_field.text().strip()
        if source.startswith("https://") or source.startswith("http://"):
            self._run(lambda client, report, cancelled: api.generate_and_download(
                client, image_url=source, on_status=report, should_cancel=cancelled
            ), "image")
            return
        if source and os.path.isfile(source):
            name = os.path.splitext(os.path.basename(source))[0][:24]
            self._run(lambda client, report, cancelled: api.generate_and_download(
                client, image_path=source, on_status=report, should_cancel=cancelled
            ), name)
            return
        self.status_label.setText("Choose an image file, or paste an https:// image link.")

    def _run(self, job: Callable[..., str], name: str) -> None:
        if self._busy:
            return
        client = self._client()
        if not client.api_key:
            self.status_label.setText(api.NO_KEY_MESSAGE)
            return
        self._cancel = False
        self._set_busy(True)
        self.progress.setValue(0)
        self.status_label.setText("Starting…")

        def report(message: str) -> None:
            percent = -1
            digits = "".join(ch for ch in message.split(" ")[-1] if ch.isdigit())
            if message.endswith("%") and digits:
                percent = int(digits)
            self._signals.status.emit(message, percent)

        def worker() -> None:
            try:
                path = job(client, report, lambda: self._cancel)
                self._signals.finished.emit(path, name)
            except api.HydrillaApiError as error:
                self._signals.failed.emit(str(error), error.kind)
            except Exception as error:
                self._signals.failed.emit(str(error), api.ERROR_API)

        threading.Thread(target=worker, name="hydrilla-generate", daemon=True).start()

    def _request_cancel(self) -> None:
        self._cancel = True
        self.cancel_button.setEnabled(False)
        self.status_label.setText("Cancelling…")

    def _on_status(self, message: str, percent: int) -> None:
        if self._cancel:
            return
        self.status_label.setText(message)
        if percent >= 0:
            self.progress.setValue(max(0, min(100, percent)))

    def _on_finished(self, path: str, name: str) -> None:
        self._set_busy(False)
        self._import(path, name)
        self._verify()

    def _on_failed(self, message: str, kind: str) -> None:
        self._set_busy(False)
        if kind == api.ERROR_CANCELLED:
            self.status_label.setText("Cancelled. Unused credits are refunded.")
            return
        self.status_label.setText(message)
        if kind == api.ERROR_AUTH:
            self.account_label.setText(message)

    def _import(self, path: str, name: str) -> None:
        try:
            self.status_label.setText(self.host.import_glb(path, name) or "Imported “%s”." % name)
        except Exception as error:
            self.status_label.setText("Could not import “%s”: %s" % (name, error))

    # ---- bridge ---------------------------------------------------------

    def _toggle_bridge(self) -> None:
        if self._bridge.is_running():
            self.stop_bridge()
            return
        result = self._bridge.start()
        if not result.get("ok"):
            self.bridge_button.setChecked(False)
            self.bridge_label.setText(str(result.get("error") or "Bridge could not start."))
            return
        self._bridge_timer.start()
        self.bridge_button.setChecked(True)
        self.bridge_button.setText("Bridge ON")
        self.bridge_label.setText("Ready to receive models (port %d)." % self._bridge.port)

    def stop_bridge(self) -> None:
        self._bridge_timer.stop()
        self._bridge.stop()
        self.bridge_button.setChecked(False)
        self.bridge_button.setText("Run Bridge")
        self.bridge_label.setText("Lets Hydrilla Studio and your AI agent send models here.")

    def _drain_bridge(self) -> None:
        for item in self._bridge.drain():
            self._import(str(item.get("file_path") or ""), str(item.get("name") or "model"))

    def closeEvent(self, event: Any) -> None:
        self._cancel = True
        self.stop_bridge()
        super().closeEvent(event)


_PANELS = {}


def show_panel(host: HostAdapter) -> HydrillaPanel:
    """Open the panel, reusing the one already open for this app."""
    existing = _PANELS.get(host.app)
    if existing is not None:
        try:
            existing.show()
            existing.raise_()
            return existing
        except RuntimeError:
            # The window was destroyed by the host app; build a new one.
            _PANELS.pop(host.app, None)
    panel = HydrillaPanel(host, parent=host.main_window())
    _PANELS[host.app] = panel
    panel.show()
    return panel
