# Accessibility plan
- Landmarks: header, nav, main, section, footer
- Skip-to-content link is the first focusable element
- Every input has a label bound with for/id
- Visible focus outline on everything interactive
- Errors appear as text under fields, linked with aria-describedby
- Status messages use role="status" (polite); cap exceeded uses role="alert" (assertive)
- Text contrast of at least 4.5:1
- Delete confirmation uses the built-in dialog element
- Whole app works with keyboard only

# Wireframe: mobile (360px)

    +------------------+
    | Title            |
    | nav links wrap   |
    +------------------+
    | Dashboard cards  |
    | (stacked)        |
    +------------------+
    | Add form         |
    +------------------+
    | Search + sort    |
    | Records (cards)  |
    +------------------+
    | Settings, About  |
    +------------------+

# Wireframe: desktop (1024px)

    +--------------------------------------+
    | Title                  nav nav nav   |
    +--------------------------------------+
    | [card] [card] [card] [card]          |
    | Add form                             |
    | Search | Sort                        |
    | Table: desc | amount | cat | date    |
    +--------------------------------------+


![Hand-drawn mobile wireframe: stacked dashboard cards, form, search and record cards](../assets/wireframe-mobile.jpg)
![Hand-drawn desktop wireframe: four stat cards in a row, form, search, and table](../assets/wireframe-desktop.jpg)
