# On-Device Playground

A web app for playing with on-device AI features.

My original motivation was to gain experince with techniques for improving inference quality.
This app provides a simple chat UX with which I can play with patterns like prompt engineering,
chain-of-thought, program-of-thought, etc.

Hosted app:
https://erikeldridge.github.io/on-device-playground

Check the console for logs if nothing renders or anything goes wrong.

## Set Up

1. `npm install`

## Develop

View the site with hot reloading:

1. `npm start`

## Preview

View the built site prior to deploying:

1. `npm run preview`

## Deploy

Update https://erikeldridge.github.io/on-device-playground:

1. Push changes to remote repo
2. GH Action defined by .github/workflows/deploy.yml runs on change

## Edit Favicon

I like trying different favicons too. Here are the steps to edit the SVG in VSCode:

1. Right click on public/favicon.svg
2. Select "Open with ..."
3. Open with text editor

## References

- [Code Agents: The Future of Agentic AI](https://towardsdatascience.com/code-agents-the-future-of-agentic-ai/)
- [Program of Thoughts Prompting: Disentangling Computation from Reasoning for Numerical Reasoning Tasks](https://arxiv.org/abs/2211.12588)
