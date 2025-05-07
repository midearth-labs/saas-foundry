import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

/**
 * Register test-only endpoints.
 * These endpoints are only available when NODE_ENV is set to 'TEST' or 'DEV'.
 */

// Simple HTML generator function so landing page looks nice
const generateHtml = (title: string, content: string, requestData: any, logo?: string, shouldRedirect = false) => {
  const currentYear = new Date().getFullYear();
  const logoHtml = logo ? `<img src="${logo}" alt="${title} logo" style="max-height: 50px; margin-bottom: 20px;">` : '';
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
      <title>${title} - SaaS-Foundry</title>
      <style>
          body { font-family: SF Pro Display, Lato, Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; text-align: center; }
          .collapsible { background-color: #f1f1f1; cursor: pointer; padding: 18px; width: 100%; border: none; text-align: left; outline: none; font-size: 15px; }
          .active, .collapsible:hover { background-color: #ddd; }
          .content { padding: 0 18px; display: none; overflow: hidden; background-color: #f9f9f9; }
          pre { white-space: pre-wrap; text-align: left; }
          footer { margin-top: 50px; text-align: center; font-size: 14px; color: #666; }
          .dev-banner { position: fixed; top: 0; left: 0; width: 100%; background-color: #F44336; color: white; text-align: center; padding: 4px; font-size: 12px; z-index: 9999; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
      </style>
  </head>
  <body>
      <div class="dev-banner">DEV/TEST MODE - NOT FOR PRODUCTION</div>
      ${logoHtml}
      <h1>${title}</h1>
      ${content}
      
      <button type="button" class="collapsible">Show Request Details</button>
      <div class="content">
          <pre>${JSON.stringify(requestData, null, 2)}</pre>
      </div>
      
      <footer>
          &copy; ${currentYear} <a href="https://midearthlabs.dev">MidEarth Labs</a>
      </footer>
      
      <script>
          ${shouldRedirect ? `
          // Auto-redirect for Stripe pages
          setTimeout(() => {
            window.location.href = "http://localhost:3005";
          }, 3000);
          ` : ''}
          const coll = document.getElementsByClassName("collapsible");
          for (let i = 0; i < coll.length; i++) {
            coll[i].addEventListener("click", function() {
              this.classList.toggle("active");
              const content = this.nextElementSibling;
              content.style.display = content.style.display === "block" ? "none" : "block";
            });
          }
      </script>
  </body>
  </html>
  `;
};

// Home page handler - exported separately to be used regardless of environment
export const handleHomePage = async (request: FastifyRequest, reply: FastifyReply) => {
  const requestData = {
    params: request.params,
    query: request.query,
    body: request.body,
    headers: request.headers,
  };
  
  const content = `<p>Welcome to the SaaS-Foundry API!</p>`;
  const html = generateHtml("Hello, SaaS-Foundry!", content, requestData);
  
  reply.type('text/html').send(html);
};

// Register all test endpoints
export const registerTestEndpoints = (server: FastifyInstance) => {
  // Set up the base endpoint 
  server.get("/", handleHomePage);

  // Echo endpoint, just print out the request data in nice HTML page
  server.get("/test/echo", async (request: FastifyRequest, reply: FastifyReply) => {
    const requestData = {
      params: request.params,
      query: request.query,
      body: request.body,
      headers: request.headers,
    };
    
    const content = `<p>This endpoint echoes back all your request details.</p>`;
    const html = generateHtml("Echo Test", content, requestData);
    
    reply.type('text/html').send(html);
  });

  // Stripe success page
  server.get("/test/stripe-success", async (request: FastifyRequest, reply: FastifyReply) => {
    const requestData = {
      params: request.params,
      query: request.query,
      body: request.body,
      headers: request.headers,
    };
    
    const content = `<p>Payment successful!</p><p>Thank you for your purchase.</p><p>Redirecting to home page...</p>`;
    const stripeLogo = "https://cdn.worldvectorlogo.com/logos/stripe-2.svg";
    const html = generateHtml("Stripe Payment Success", content, requestData, stripeLogo, true);
    
    reply.type('text/html').send(html);
  });

  // Stripe cancel page
  server.get("/test/stripe-cancel", async (request: FastifyRequest, reply: FastifyReply) => {
    const requestData = {
      params: request.params,
      query: request.query,
      body: request.body,
      headers: request.headers,
    };
    
    const content = `<p>Payment cancelled.</p><p>Your payment was not processed.</p>`;
    const stripeLogo = "https://cdn.worldvectorlogo.com/logos/stripe-2.svg";
    const html = generateHtml("Stripe Payment Cancelled", content, requestData, stripeLogo, true);
    
    reply.type('text/html').send(html);
  });

  // Test endpoint to simulate an error
  server.get("/test/error", async (request: FastifyRequest, reply: FastifyReply) => {
    throw new Error("Test error endpoint");
  });

  console.log("Test endpoints registered");
  return server;
};
