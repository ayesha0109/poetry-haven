# Poetry Haven

A responsive web app where users can sign up, log in and share poems.

## Features
- Sign up and log in (username + hashed password)
- Publish poems when logged in; every visitor can read them
- Delete your own poems
- Responsive layout for phones and desktops

## Tech stack
HTML5, CSS3, JavaScript (vanilla), Git/GitHub

## How to run
1. Download or clone this repository.
2. Open `index.html` in a browser. No install needed.

## How it works
- `index.html`: page structure and the login dialog
- `style.css`: layout, colours and responsive styles
- `script.js`: authentication, saving and rendering poems

Data is saved in the browser's `localStorage`, so each browser keeps its own users and poems.

## Limitations
This is a front-end project with no server. Authentication is client-side only, which is fine for learning but is **not secure** for real users. A production version would need a backend (for example Node.js or Spring Boot) and a database.

## What I learned
DOM manipulation, form handling, localStorage, password hashing with the Web Crypto API, and deploying a static site.

## Future improvements
Add a backend and database, likes and comments, and editing poems.
