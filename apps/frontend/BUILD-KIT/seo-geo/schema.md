# JSON-LD per page type

Rules: one `@graph` per page, emitted by the existing `JsonLd` component. Shared nodes are defined once (section 1) and referenced by `@id` elsewhere. Text in FAQPage and HowTo must match the visible page text (the blocks below were generated from the final page copy). No Meshy, Tripo, or other third-party model is represented as part of Hydrilla anywhere. No credential, key, or model-choice wording. No format names in pricing Offers. Hawan Research Labs is never `creator`, `developer`, `publisher`, `provider`, or `parentOrganization` of Hydrilla. The `#organization` id must match whatever id the site already uses sitewide; confirm in the repo.

## 1. Shared nodes (sitewide graph)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://hydrilla.ai/#organization",
      "name": "Hydrilla AI",
      "alternateName": "Hydrilla",
      "url": "https://hydrilla.ai",
      "description": "Hydrilla AI is an AI 3D workspace for studio and artist pipelines.",
      "disambiguatingDescription": "AI 3D software company that builds the Hydrilla workspace and BlueFox, Hydrilla's 3D model",
      "sameAs": [
        "https://x.com/hydrillaai",
        "https://www.linkedin.com/company/hydrilla-ai",
        "https://www.reddit.com/r/hydrilla",
        "https://www.instagram.com/hydrilla.ai"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "founders@hydrilla.ai",
        "contactType": "customer support"
      },
      "subOrganization": {
        "@id": "https://hydrilla.ai/research#lab"
      }
    },
    {
      "@type": "ResearchOrganization",
      "@id": "https://hydrilla.ai/research#lab",
      "name": "Hawan Research Labs",
      "url": "https://hydrilla.ai/research",
      "description": "Hawan Research Labs is Hydrilla AI's research lab, where the 3D research happens and BlueFox is built.",
      "parentOrganization": {
        "@id": "https://hydrilla.ai/#organization"
      }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://hydrilla.ai/features#software",
      "name": "Hydrilla",
      "applicationCategory": "DesignApplication",
      "operatingSystem": "Web",
      "url": "https://hydrilla.ai/features",
      "publisher": {
        "@id": "https://hydrilla.ai/#organization"
      },
      "featureList": [
        "Text to 3D with BlueFox",
        "Image to 3D with BlueFox",
        "Segmented meshes with UVs and PBR maps",
        "In-browser preview",
        "Export to GLB, FBX, OBJ, and USDZ",
        "Plugins for Blender, Unity, Unreal, and Godot",
        "MCP server",
        "REST API",
        "Water Agent"
      ],
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "USD",
        "lowPrice": "0",
        "highPrice": "12",
        "url": "https://hydrilla.ai/pricing"
      }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://hydrilla.ai/bluefox#model",
      "name": "BlueFox",
      "alternateName": "BlueFox 1",
      "softwareVersion": "1",
      "description": "BlueFox, Hydrilla's 3D model, is built by Hydrilla AI. Its current version is BlueFox 1.",
      "disambiguatingDescription": "Hydrilla's 3D model, generally available in Hydrilla",
      "applicationCategory": "DesignApplication",
      "url": "https://hydrilla.ai/bluefox",
      "creator": {
        "@id": "https://hydrilla.ai/#organization"
      },
      "isPartOf": {
        "@id": "https://hydrilla.ai/features#software"
      },
      "sameAs": [
        "https://huggingface.co/Hydrilla/BlueFox3D"
      ]
    }
  ]
}
```

## 2. Homepage `/`: OPTIONAL hidden fix (needs Rishi's yes)

No visible homepage change. This is a JSON-LD-only edit and ships only if Rishi approves it. Live today, the homepage graph is upside down: the ResearchOrganization `https://hydrilla.ai/research#organization` "Hawan Research Labs" lists Hydrilla as its `subOrganization`, and the Organization `#organization` lists the lab as its `parentOrganization`.

The edit:
1. On `#organization`: remove `parentOrganization`; add `"subOrganization": {"@id": "<lab id>"}`.
2. On the lab node: remove `subOrganization`; add `"parentOrganization": {"@id": "https://hydrilla.ai/#organization"}`; set `description` to "Hawan Research Labs is Hydrilla AI's research lab, where the 3D research happens and BlueFox is built." Keep its existing `@id` and type (or switch to `/research#lab` sitewide, if used consistently).
3. Nothing else in the homepage JSON-LD changes (the BlueFox node's existing description stays).

## 3. `/features`
WebPage + the full `features#software` node from section 1.

## 4. `/bluefox`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://hydrilla.ai/bluefox#model",
      "name": "BlueFox",
      "alternateName": "BlueFox 1",
      "softwareVersion": "1",
      "description": "BlueFox, Hydrilla's 3D model, is built by Hydrilla AI. Its current version is BlueFox 1.",
      "disambiguatingDescription": "Hydrilla's 3D model, generally available in Hydrilla",
      "applicationCategory": "DesignApplication",
      "url": "https://hydrilla.ai/bluefox",
      "creator": {
        "@id": "https://hydrilla.ai/#organization"
      },
      "isPartOf": {
        "@id": "https://hydrilla.ai/features#software"
      },
      "sameAs": [
        "https://huggingface.co/Hydrilla/BlueFox3D"
      ]
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Product",
          "item": "https://hydrilla.ai/features"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "BlueFox",
          "item": "https://hydrilla.ai/bluefox"
        }
      ]
    }
  ]
}
```

Remove any Offer block copied from the old `/bluefox3d` page.

## 5. `/water`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://hydrilla.ai/water#software",
      "name": "Water Agent",
      "alternateName": "Hydrilla Water Agent",
      "description": "Hydrilla Water Agent is the AI 3D agent that works alongside artists and studios, from brief to finished assets, inside the tools they already use.",
      "url": "https://hydrilla.ai/water",
      "applicationCategory": "DesignApplication",
      "operatingSystem": "Web",
      "isPartOf": {
        "@id": "https://hydrilla.ai/features#software"
      },
      "provider": {
        "@id": "https://hydrilla.ai/#organization"
      },
      "featureList": [
        "Build 3D asset sets from a brief, in conversation",
        "Revise piece by piece",
        "Works inside Blender, Unity, Unreal, and Godot through the Hydrilla plugin"
      ],
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Included on every Hydrilla plan, no credits"
      }
    },
    {
      "@type": "HowTo",
      "@id": "https://hydrilla.ai/water#howto",
      "name": "From brief to finished set",
      "step": [
        {
          "@type": "HowToStep",
          "position": 1,
          "text": "Write the brief like a creative director: the pieces, the style, and where the assets will be used."
        },
        {
          "@type": "HowToStep",
          "position": 2,
          "text": "Review the plan and adjust it until it matches your intent."
        },
        {
          "@type": "HowToStep",
          "position": 3,
          "text": "Water Agent builds the set to the direction you gave it."
        },
        {
          "@type": "HowToStep",
          "position": 4,
          "text": "Check each piece, ask for changes in the conversation, and take the finished set into your project."
        }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://hydrilla.ai/water#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What does Water Agent cost?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Water Agent costs no credits and is included on every plan."
          }
        },
        {
          "@type": "Question",
          "name": "Who is it for?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "3D artists, art leads, and studio teams who brief whole sets of assets and need them to hold together."
          }
        },
        {
          "@type": "Question",
          "name": "Can a brief be a single asset?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. A brief can be one prop or a whole scene, and Water Agent plans only what you ask for."
          }
        },
        {
          "@type": "Question",
          "name": "When should I use text to 3D instead?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "When you already know the one model you want. Text to 3D starts from a prompt, and image to 3D starts from a reference."
          }
        },
        {
          "@type": "Question",
          "name": "How is Water Agent different from the MCP server?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Water Agent is the agent inside Hydrilla. The MCP server lets your own AI agent drive Hydrilla from outside."
          }
        }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Product",
          "item": "https://hydrilla.ai/features"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Water Agent",
          "item": "https://hydrilla.ai/water"
        }
      ]
    }
  ]
}
```

## 6. `/text-to-3d` and `/image-to-3d`
WebPage + HowTo. No Offer blocks.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HowTo",
      "@id": "https://hydrilla.ai/text-to-3d#howto",
      "name": "Text to 3D with BlueFox",
      "step": [
        {
          "@type": "HowToStep",
          "position": 1,
          "text": "Write a prompt naming the subject, its style, and its use."
        },
        {
          "@type": "HowToStep",
          "position": 2,
          "text": "An image model renders a reference, at Low or High quality, in a square, landscape, or portrait frame."
        },
        {
          "@type": "HowToStep",
          "position": 3,
          "text": "Adjust the image with an Edit prompt until it looks right."
        },
        {
          "@type": "HowToStep",
          "position": 4,
          "text": "Generate the 3D model, then preview it and export."
        }
      ]
    }
  ]
}
```

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HowTo",
      "@id": "https://hydrilla.ai/image-to-3d#howto",
      "name": "Image to 3D with BlueFox",
      "step": [
        {
          "@type": "HowToStep",
          "position": 1,
          "text": "Upload a picture of the object you want."
        },
        {
          "@type": "HowToStep",
          "position": 2,
          "text": "Start the job, and the picture becomes a model split into parts."
        },
        {
          "@type": "HowToStep",
          "position": 3,
          "text": "Spin it in the preview, check each part, then export."
        }
      ]
    }
  ]
}
```

## 7. `/pricing`
The only page with Offer nodes. Plus the FAQPage.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://hydrilla.ai/features#software",
      "name": "Hydrilla",
      "offers": [
        {
          "@type": "Offer",
          "name": "Free",
          "price": "0",
          "priceCurrency": "USD",
          "description": "100 credits a month",
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "price": "0",
            "priceCurrency": "USD",
            "unitText": "MONTH"
          },
          "url": "https://hydrilla.ai/pricing"
        },
        {
          "@type": "Offer",
          "name": "Starter",
          "price": "5",
          "priceCurrency": "USD",
          "description": "900 credits a month",
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "price": "5",
            "priceCurrency": "USD",
            "unitText": "MONTH"
          },
          "url": "https://hydrilla.ai/pricing"
        },
        {
          "@type": "Offer",
          "name": "Pro",
          "price": "12",
          "priceCurrency": "USD",
          "description": "3,000 credits a month, REST API access",
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "price": "12",
            "priceCurrency": "USD",
            "unitText": "MONTH"
          },
          "url": "https://hydrilla.ai/pricing"
        },
        {
          "@type": "Offer",
          "name": "Hourly",
          "price": "3",
          "priceCurrency": "USD",
          "description": "900 credits a month, in one chosen hour a day",
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "price": "3",
            "priceCurrency": "USD",
            "unitText": "MONTH"
          },
          "url": "https://hydrilla.ai/pricing"
        },
        {
          "@type": "Offer",
          "name": "Hourly Pro",
          "price": "8",
          "priceCurrency": "USD",
          "description": "3,000 credits a month in a chosen daily window, 33% off Pro",
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "price": "8",
            "priceCurrency": "USD",
            "unitText": "MONTH"
          },
          "url": "https://hydrilla.ai/pricing"
        }
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://hydrilla.ai/pricing#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What does a model cost?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A model from text costs 45 credits and a model from an uploaded image costs 30, at default quality."
          }
        },
        {
          "@type": "Question",
          "name": "Do unused credits carry over?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Allowances reset each billing month."
          }
        },
        {
          "@type": "Question",
          "name": "How does the 14-day trial work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Start on the Free plan, or try any Monthly or Hourly plan, Pro included, free for 14 days. The trial needs a card."
          }
        },
        {
          "@type": "Question",
          "name": "How do Hourly plans save?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Hourly Pro gives Pro's 3,000 credits for 33% less, $8 instead of $12, in a chosen daily window. Hourly gives Starter's 900 credits for $3 instead of $5, in one chosen hour a day."
          }
        },
        {
          "@type": "Question",
          "name": "Which plan includes the API?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pro includes REST API access."
          }
        }
      ]
    }
  ]
}
```

## 8. `/enterprise`
WebPage + ContactPoint (sales) + FAQPage.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPoint",
      "@id": "https://hydrilla.ai/enterprise#contact",
      "contactType": "sales",
      "email": "founders@hydrilla.ai",
      "url": "https://cal.com/hydrilla"
    },
    {
      "@type": "FAQPage",
      "@id": "https://hydrilla.ai/enterprise#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How is our data handled?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Your data isn't used to train our models, on any plan. Generated assets are kept to your own workspace, and the security page explains both."
          }
        },
        {
          "@type": "Question",
          "name": "Can we send a security questionnaire?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Send it to founders@hydrilla.ai, naming your studio and when you need answers. We answer in writing with what we can confirm."
          }
        }
      ]
    }
  ]
}
```

## 9. `/faq`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      "@id": "https://hydrilla.ai/faq#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Do I own the 3D models I generate?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Hydrilla's Terms of Service cover ownership of the 3D assets you generate. The ownership section of the Terms has the exact wording."
          }
        },
        {
          "@type": "Question",
          "name": "Can I upload reference images I didn't create?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Only upload images you have the right to use. The Terms apply to everything you upload."
          }
        },
        {
          "@type": "Question",
          "name": "How do I sign in?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You sign in to Studio with your Hydrilla account. How each plugin signs in is listed on integrations."
          }
        },
        {
          "@type": "Question",
          "name": "Can I delete my work or my account?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "To close your account or ask for its data to be deleted, write to founders@hydrilla.ai from your account email."
          }
        },
        {
          "@type": "Question",
          "name": "Where can I read how my data is handled?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The Privacy Policy covers personal data. The security page covers model training, accounts, stored assets, and exports for studio reviewers."
          }
        },
        {
          "@type": "Question",
          "name": "How do I get help?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Email founders@hydrilla.ai or use the contact form. For a generation problem, include your account email, the workspace, and a screenshot."
          }
        },
        {
          "@type": "Question",
          "name": "Where should I start if I'm new?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Follow the steps in the docs, from sign-up to a first import in your own tools."
          }
        }
      ]
    }
  ]
}
```

## 10. `/research`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ResearchOrganization",
      "@id": "https://hydrilla.ai/research#lab",
      "name": "Hawan Research Labs",
      "url": "https://hydrilla.ai/research",
      "description": "Hawan Research Labs is Hydrilla AI's research lab, where the 3D research happens and BlueFox is built.",
      "parentOrganization": {
        "@id": "https://hydrilla.ai/#organization"
      }
    },
    {
      "@type": "TechArticle",
      "@id": "https://hydrilla.ai/research#model-card",
      "headline": "BlueFox 1 model card",
      "about": {
        "@id": "https://hydrilla.ai/bluefox#model"
      },
      "author": {
        "@id": "https://hydrilla.ai/research#lab"
      },
      "publisher": {
        "@id": "https://hydrilla.ai/#organization"
      },
      "url": "https://hydrilla.ai/research#model-card"
    }
  ]
}
```

## 11. Other page types

| Page type | Routes | Types | Notes |
|---|---|---|---|
| Integrations hub | `/integrations` | CollectionPage + ItemList (the 6 cards) | |
| Integration children | `/integrations/blender`, `/unity`, `/unreal`, `/godot`, `/mcp` | SoftwareApplication (the plugin or server; `publisher` #organization; `isPartOf` features#software) + HowTo (the install steps, word for word) | No `softwareVersion` until versions are confirmed |
| API | `/api` | WebAPI (`provider` #organization; `documentation` only once the API docs host is confirmed) | No quota or call numbers |
| Solutions | `/solutions` (CollectionPage + ItemList), `/solutions/*` (WebPage) | | Remove any copied SoftwareApplication or Offer nodes |
| Docs | `/docs` | TechArticle + HowTo (the 6 first-export steps) | |
| Articles | `/blog/reference-images`, `/blog/import-ai-meshes` | Article (`datePublished`, `dateModified` = content date; `author` and `publisher` #organization) | |
| Compare articles | `/compare/meshy`, `/compare/tripo`, `/compare/hyper3d`, `/compare/how-to-choose` | Article; competitor pages add `about` → Thing (`name`, `sameAs` the competitor's own site) **only** | No `brand`, `partner`, `isPartOf`, `review`, or `aggregateRating`; nothing links a competitor to Hydrilla |
| Hubs | `/blog`, `/compare`, `/changelog` | CollectionPage + ItemList | |
| Company | `/about` AboutPage; `/team` WebPage + Person per card; `/careers` WebPage (JobPosting only for real, open roles); `/contact` ContactPage; `/security` WebPage | | |
| Legal | `/privacy`, `/terms`, `/cookies` | WebPage | |
| Press kit | `/brand` | WebPage | noindex |

Every page also gets `WebPage` with `url`, `name` (the title without the suffix), `isPartOf` → a `WebSite` node (`@id` `https://hydrilla.ai/#website`, `publisher` #organization), and a BreadcrumbList that follows the nav (Product, Solutions, Resources, Company).
