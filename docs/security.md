---
title: Security Implementations
nav_order: 10
---

# Security Implementations

I have implemented several security measures to ensure the protection of data and the integrity of the systems. Below are the key security implementations in place:

## **Data Protection**

I have implemented **Row Level Security (RLS)** to ensure that users can only access their own data. RLS policies restrict table access based on the current user's context, enhancing privacy and security at the database level.

## **Secure Storage**

I have developed a secure session storage wrapper that saves data securely using **AES encryption**. The encryption key is stored securely in GitHub repository secrets and injected during deployment with GitHub Actions. Moreover, tamper protection has been added to prevent any injection or manipulation of session storage, safeguarding against impersonation attacks.

## **SSL Encryption**

All communications between the frontend and the API are secured using **HTTPS**. SSL encryption protects data in transit from eavesdropping and man-in-the-middle attacks. I am using **Cloudflare** to manage SSL certificates and ensure secure connections.

## **Authentication and Authorization**

I use robust authentication mechanisms, such as JWT tokens, and have implemented role-based access control (RBAC) with **buyer** and **seller** roles to restrict access to sensitive features accordingly.

## **Bot Protection with Turnstile**

I have implemented **Turnstile**, a smart CAPTCHA alternative, to protect the website from bots and automated abuse. Turnstile can be embedded into any website without sending traffic through Cloudflare, enhancing user privacy and ensuring a seamless user experience while maintaining security.

## **Regular Security Audits**

I conduct periodic security audits and penetration testing to identify vulnerabilities. I stay informed about the latest security threats and apply patches promptly. I utilize tools like **Dependabot** for automatic dependency updates.