# Quick Start - VPS Deployment

## 🚀 Fastest Way to Deploy

### TL;DR - 5 Minutes

```bash
# 1. On your VPS
cd /var/www
git clone https://github.com/aspiren-tech/ziya-forms.git
cd ziya-forms

# 2. Install dependencies
npm install

# 3. Build project
npm run build

# 4. Configure environment
nano .env.prod
# Update MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, NEXTAUTH_URL

# 5. Setup database
mysql -u root -p < lib/mysql/schema.sql

# 6. Start with PM2
npm install -g pm2
pm2 start "npm run start" --name "ziya-forms"
pm2 save
```

---

## 📝 Your Three Environment Files

### `.env.prod` - Production
**When to use:** `npm run start` on live VPS
```bash
npm run start
```

### `.env.stage` - Staging
**When to use:** `npm run start:stage` for testing
```bash
npm run start:stage
```

### `.env.local` - Local Development
**When to use:** `npm run start:local` for development
```bash
npm run start:local
```

---

## ✅ What's Already Perfect

| Item | Status | Details |
|------|--------|---------|
| Database Schema | ✅ | 5 tables with proper indexes |
| Authentication | ✅ | NextAuth.js with JWT + OAuth |
| Environment Config | ✅ | 3 env files (local/stage/prod) |
| API Routes | ✅ | RESTful design, properly organized |
| Middleware | ✅ | Route protection & auth check |
| Build Config | ✅ | Turbopack enabled for fast builds |
| Dependencies | ✅ | All production-ready packages |
| TypeScript | ✅ | Fully typed application |

---

## 🔴 Critical Setup Steps

Before running on VPS:

1. **Generate New NEXTAUTH_SECRET**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Update `.env.prod`** with your actual values:
   - Database credentials
   - NEXTAUTH_URL (your domain)
   - Google OAuth credentials
   - Email settings

3. **Create MySQL user** with proper permissions
   ```bash
   mysql -u root -p
   CREATE USER 'ziya_user'@'localhost' IDENTIFIED BY 'strong_password';
   GRANT ALL PRIVILEGES ON ziya_forms_prod.* TO 'ziya_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. **Build before running**
   ```bash
   npm run build
   ```

---

## 📊 Project Structure Summary

```
ziya-forms/
├── app/                 # Next.js app (pages & API)
│   ├── api/            # REST API endpoints
│   ├── auth/           # Login/register pages
│   ├── dashboard/      # User dashboard
│   ├── form/           # Form builder & view
│   └── responses/      # Response analytics
├── components/         # Reusable React components
├── lib/               # Utilities & database
│   ├── mysql/         # Database connection & schema
│   ├── auth.ts        # Authentication helpers
│   └── config.ts      # App configuration
├── scripts/           # Startup scripts
│   ├── start.js       # Production server
│   ├── start-stage.js # Staging server
│   └── start-local.js # Development server
├── .env.local         # Local development config
├── .env.stage         # Staging config
├── .env.prod          # Production config
├── next.config.ts     # Next.js config
├── tsconfig.json      # TypeScript config
└── package.json       # Dependencies
```

---

## 🎯 Commands Quick Reference

| Command | Use | Environment |
|---------|-----|-------------|
| `npm run dev` | Hot-reload development | `.env.local` |
| `npm run build` | Create production build | - |
| `npm start` | Run production server | `.env.prod` |
| `npm run start:stage` | Run staging server | `.env.stage` |
| `npm run start:local` | Run local server | `.env.local` |
| `npm run lint` | Check code quality | - |
| `npm run type-check` | TypeScript validation | - |

---

## 🔒 Security Checklist

- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Database credentials are strong
- [ ] NEXTAUTH_URL matches your domain
- [ ] `.env.prod` is NOT committed to Git
- [ ] SSL/HTTPS configured
- [ ] Database backups configured
- [ ] Firewall only allows 80, 443, 22
- [ ] Regular security updates scheduled

---

## 🆘 If Something Goes Wrong

| Problem | Solution |
|---------|----------|
| "Production build not found" | Run `npm run build` first |
| "Cannot connect to database" | Check MySQL is running, credentials correct |
| "Port 3000 already in use" | Use `PORT=3001 npm start` |
| "Module not found" | Run `npm install` again |
| "NEXTAUTH_SECRET error" | Generate new secret, update `.env.prod` |

---

**Ready to deploy?** Follow the 5-minute setup above! ✅
