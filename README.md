# Scrumnonymous

Scrumnonymous is a curated collection of articles and blog posts that promote Lean Software Development with critique and analysis of Scrum and agile pitfalls and misunderstandings.

## Contributing an Anthology

Got a Lean or agile article (your own?) to share?Add a link and summary to the collection of anthologies.

#### 1. Create a New Anthology File

Navigate to the `src/content/anthologies/` directory and create a new `.mdx` file for your article. The filename should be a slug-friendly version of the article's title (e.g., `my-awesome-article.mdx`).

#### 2. Add Frontmatter

At the beginning of your `.mdx` file, you must include the following frontmatter:

```mdx
---
title: 'Title of Your Article'
author: 'Author Name'
description: 'A brief, one-sentence summary of your article.'
pubDate: YYYY-MM-DD # The original publication date of the article
originUrl: 'https://example.com/your-original-article'
image: 'https://example.com/path/to/your/image.jpg' # A URL to a relevant image
imageAlt: 'A descriptive alt text for the image'
---
```

#### Frontmatter Fields Explained

-   **title**: The title of the article.
-   **author**: The name of the author.
-   **description**: A short description of the article.
-   **pubDate**: The date the article was originally published, in `YYYY-MM-DD` format.
-   **originUrl**: The canonical URL of the original article.
-   **image**: A URL to a hero image for the article.
-   **imageAlt**: Alternative text for the image, for accessibility.
