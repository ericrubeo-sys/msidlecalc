# MapleStory art and asset research

**Reviewed:** 2026-10-21  
**Purpose:** Identify the art visible in the BasilMarket references, locate official MapleStory Worlds creator resources, and decide what is appropriate to store in the public msIdleCalc repository.

**Product direction:** We expect to use only a small, designer-curated number of MapleStory sprites. The Designer will eventually select candidates that suit the BasilMarket-inspired light mode and Hidden Street-inspired dark mode. MapleStory.io is the preferred technical source for prototyping these candidates by item/monster ID; it is not treated as a permission grant or an already-approved production dependency.

## What the supplied BasilMarket screenshots show

- The current BasilMarket screenshot uses MapleStory-style pixel art in its identity area and many small equipment/item thumbnails in market cards.
- The older Wayback Machine screenshot shows a pixel-art MapleStory scene in the masthead and a dense grid of item icons. Some broken image placeholders are visible.
- These are visual observations only. The screenshots do not identify the actual file URLs, source archives, creator, or license for any individual asset. They do not prove BasilMarket's assets are licensed for reuse by another site.

## Official MapleStory Worlds resource catalog

The [MapleStory Worlds Resource Search](https://maplestoryworlds-resourcesearch-new.nexon.com/?locale=en) is the public discovery surface for resources creators can use in MapleStory Worlds. Nexon's [Finding Resources documentation](https://maplestoryworlds-creators.nexon.com/en/docs?postId=211) says the in-editor Resource Storage contains MSW resources such as sprites, animation clips, audio clips, and avatar items. Sprite categories include items, monsters, NPCs, objects, skills, and other game elements. Creators can search by text and, for sprites, by image, then use a resource's RUID in their world.

The documentation explicitly says MSW resources **can't be saved** from Resource Storage; their RUID is used to reference them while creating. The [Universal Resource Collection](https://maplestoryworlds-creators.nexon.com/en/docs?postId=936) is another official index of common creator resources and their identifiers.

The resource search page is dynamically rendered, so this review could confirm the catalog and official documentation but could not interactively inspect every individual item or export an asset file. A resource ID is a reference for the MSW creator environment, not a downloadable file or a web-use license.

## Practical ways fan projects currently access the art

| Route | What it provides | Practical fit for msIdleCalc | Limits |
| --- | --- | --- | --- |
| **MapleStory Worlds Resource Search / Creator Maker** | Searchable official resource packs, sprites, animations, and resource IDs (RUIDs). | Useful for browsing and for projects built inside MapleStory Worlds. | The documented RUID workflow loads resources into MSW; it is not an export feed or an independent-site asset license. |
| **MapleStory.io API** | A third-party API can return icons and data by region, game version, and item/monster ID. Its API docs list item and mob icon endpoints, character renders, maps, NPCs, and more. | Fastest way to prototype a familiar item-icon grid without bundling image files in our repository. The MapleStory Wiki and other community projects demonstrably use the API pattern. | The API labels itself **Unlicensed** and says the media, icons, descriptions, and character information are Nexon's property and subject to Nexon's terms. Runtime loading instead of committing files does not create permission. It is also an external service dependency and could change or go offline. |
| **Community wikis / image pages** | Browsable item and monster pages, IDs, and image previews; a useful discovery and cross-check source. | Good for finding names/IDs and checking the correct region/version. | Wiki article text may have a Creative Commons license, but the wiki itself distinguishes Nexon-owned game sprites. A wiki's CC license for its text does not license those sprites for our app. |
| **Official game client data (WZ/NX archives)** | The installed client contains structured game data and image resources; third-party tools can parse these archives and render/extract PNGs. | Technically useful for building a local catalog, matching IDs, or analyzing game data. | Extracting creates copies of the copyrighted art. Publicly available parsers or repositories containing extracted files are not proof that Nexon licensed redistribution. Don't upload extracted files to the public repo without permission. |
| **Ask the rights holder** | Written answer scoped to this product and intended asset use. | The route that could give us a clear basis for using official sprites on an independent public site, including through an API or a repo. | Need to specify use, scope, hosting, modification, monetization, attribution, and whether redistribution in public GitHub is allowed. |

The MapleStory.io API is a concrete technical avenue, and community projects do use its URLs for item icons. For example, the [MapleStory Wiki source](https://github.com/crrio/maplestory-wiki) uses region/version/item-ID API patterns; another fan calculator documents a similar item-icon integration. This shows a common implementation pattern, not Nexon authorization for msIdleCalc.

The official game client can be installed through Nexon's launcher, and third-party tools exist to inspect WZ archives. We should use this route only for authorized local research and data matching, not as a way to evade the published usage scope or to populate the public repository with extracted images.

## What the permission covers

Nexon's [MSW Content Production IP Usage Guide](https://maplestoryworlds.nexon.com/ko/legal/policy/1030) frames the license around creating and publishing Creator Generated Content on the MapleStory Worlds platform. Its scope says Nexon game IP must not be used outside that platform, except as expressly identified in the guide. This means “available to creators in MapleStory Worlds” should not be read as permission to copy those sprites into msIdleCalc.com.

Nexon's separate [Game IP Guide for Content Creators](https://maplestoryworlds.nexon.com/ko/legal/policy/1037) addresses fan-created content and attribution. It is not a clear blanket permission to redistribute raw game sprites in a public code repository or use them as an app's bundled asset library. The exact application of these policies to a particular calculator and asset use is a rights-holder question.

## Repository decision

**Do not commit MapleStory sprites, extracted client files, BasilMarket images, or screenshots as production assets to the public msIdleCalc GitHub repository unless Nexon or the relevant rights holder gives written permission covering both independent website use and public repository redistribution.** Public source control makes the committed files available to anyone who can access the repository; deploying the site would also make the images available to site visitors.

For now, the repository may contain this research note and links to official catalogs and policy pages. The design goal is a small curated selection for each visual mode, not a bulk mirror of game art. MapleStory.io may be used as the preferred source for a limited technical prototype after reviewing its current service conditions; don't treat hotlinking as a rights workaround or ship it as the production asset source until permissions and the external dependency are reviewed. Use placeholders or cleared assets meanwhile.

## Follow-up if MapleStory sprites remain important

1. Build a candidate list using names/RUIDs in the official creator catalog, without treating those identifiers as permission to export.
2. Ask Nexon/the rights holder in writing whether the specific assets may be used on an independent, publicly accessible fan calculator and committed to a public GitHub repository; ask about attribution, monetization, modification, and hosting requirements.
3. Record the decision and any conditions in `docs/DECISIONS.md` before adding any files.

## 2026-10-25 — User-requested monster-loading prototype

The user explicitly requested MapleStory.io monster artwork for a cute back-and-forth picture-processing animation and a local viewing option while deployments are rate limited. Implement a three-image external prototype, not a sprite binary mirror. No deployment is part of this checkpoint.

| Cast | Verified GMS83 ID | Fixed PNG endpoint |
|---|---|---|
| Slime |210100| https://maplestory.io/api/GMS/83/mob/210100/icon |
| Orange Mushroom |1210102| https://maplestory.io/api/GMS/83/mob/1210102/icon |
| Ribbon Pig |1210101| https://maplestory.io/api/GMS/83/mob/1210101/icon |

Each identity was checked against the provider's corresponding `/name` response; each actual PNG was visually inspected. The provider's [MobController source](https://github.com/crrio/maplestory.io/blob/master/maplestory.io/Controllers/API/MobController.cs) establishes the icon endpoint's static standing/flying-frame behavior. The animation uses original CSS travel, facing flips and hop/waddle motion around these static PNGs, not extracted native walk-frame sequences. Actual browser requests loaded all three images with natural sizes64×49,63×58 and68×49 respectively. One initial name lookup timed out before succeeding; provider availability remains external.

Fixed URLs contain no screenshot bytes, OCR transcript, entered stats or image-derived identifiers. Images use no-referrer; only the fixed artwork requests reach the provider. The scene stops when photo processing ends, supports reduced motion, and has an image-failure fallback. Retain the existing Nexon attribution. User authorization for a reversible local prototype does not establish a new redistribution license; private review PNGs remain ignored, with no monster binaries in `public/` or Git history.

## Sources

- [MapleStory Worlds Resource Search](https://maplestoryworlds-resourcesearch-new.nexon.com/?locale=en)
- [MapleStory Worlds Creator Center: Finding Resources](https://maplestoryworlds-creators.nexon.com/en/docs?postId=211)
- [MapleStory Worlds Creator Center: Universal Resource Collection](https://maplestoryworlds-creators.nexon.com/en/docs?postId=936)
- [MSW Content Production IP Usage Guide](https://maplestoryworlds.nexon.com/ko/legal/policy/1030)
- [NEXON Game IP Guide for Content Creators](https://maplestoryworlds.nexon.com/ko/legal/policy/1037)
- [BasilMarket Library](https://basilmarket.net/library) (the site's library page identifies it as fan-made and says MapleStory-related trademarks and assets belong to their respective owners; it does not establish that its image files are reusable by third parties)
- [MapleStory.io API documentation](https://maplestory.io/) (lists image/data endpoints and labels the service Unlicensed; it says MapleStory media remains Nexon's property)
- [MapleStory Wiki source repository](https://github.com/crrio/maplestory-wiki) (community implementation reference for API-based images; not an asset license)
- [Nexon support: install MapleStory](https://support-maplestory.nexon.com/hc/en-us/articles/43855651499284-How-to-install-MapleStory) (official client install instructions)
