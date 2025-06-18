Chatatoe

Chatatoe is a lightweight, Discord-inspired chat application — originally built as a learning project to explore full-stack deployment and real-time communication.

This project served as a hands-on way to deepen my understanding of hosting, authentication, and scalable architecture. The current version is a foundational stepping stone toward a more ambitious interactive platform.
Purpose

   Learn and practice full-stack deployment

   Build a real-time web app with user authentication

   Experiment with scalable project structure and UI/UX

🌐 What's Next?

While this version of Chatatoe is a simple chatroom clone, my long-term goal is to transform the platform into a social web game — think “Discord meets Habbo Hotel”:

    Users will have customizable avatars

    Avatars can walk around virtual servers/rooms

    Chat and interaction will remain core features

    Emphasis on creative expression and community

I’m taking my time with the next phase — I still have a lot to learn and I want to do it right.  

--Security Note--      
This repository *shouldn't!* expose any authentication keys or secrets. I really hope I remebered everything lol
My .gitignore is configured to exclude sensitive files like .env.  

--Final Thoughts--      
Chatatoe is both a functional app and a personal milestone. I'm proud of how far I've come, and excited for where it's going. If you’re curious,     
feel free to explore the code or reach out with ideas!


      --Deployment Stack--      
Deliberately self-managed and deployed to gain real-world DevOps experience:

🖥️ Locally hosted Linux server — fully configured and maintained by me

🔁 Apache — acts as a reverse proxy with enforced HTTPS redirection

☁️ Cloudflare — manages DNS and SSL/TLS, with forced HTTPS at the edge

🔐 Clerk — handles secure user authentication and session management

🛢️ Railway + MySQL — cloud-hosted relational database for persistent data storage
