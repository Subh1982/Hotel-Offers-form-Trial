# Explorer Offer Submission

Static no-backend form for Pacific hotel offer submissions.

Hotels complete the form in the browser and download a ZIP package containing:

- `submission.json`
- `submission-summary.txt`
- entered offer details for Red Hot Rooms, More Escapes, Hotel stay, Dining, Events, or Partners
- saved translation previews for English, Thai, Vietnamese, Bahasa Indonesia, or Japanese
- selected proof files, screenshots, menu PDFs, and resized images

Images can be uploaded individually, or the hotel can upload one master image that is resized into:

- banner image: 2048 x 1366px
- listing tile image: 400 x 250px
- social image: minimum 1080 x 1080px

Image source files must not exceed 200 MB.

The page interface can be displayed in English, Thai, Vietnamese, Bahasa Indonesia, or Japanese. The selected page language is treated as the source language for entered content. The bottom translation preview can generate a draft translation through the public MyMemory translation endpoint, show it for review/editing, and save the approved preview into the ZIP package.

No information is stored by this page. Offer content is sent to the public MyMemory translation endpoint only when the hotel clicks the preview translation button.
