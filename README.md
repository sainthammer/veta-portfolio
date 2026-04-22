# Veta Sergeeva — Portfolio

Лендинг-визитка с портфолио для SMM-специалиста. Стек: **Astro 4 + React 18 + Tailwind 3 + GSAP + Lenis**. Контент управляется через **Decap CMS** (git-based админка). Деплой — **Docker Compose + nginx + Let's Encrypt** на Debian 13.

---

## 📁 Структура проекта

```
veta-portfolio/
├── src/
│   ├── assets/portfolio/       # Изображения портфолио (загружаются через CMS)
│   ├── components/             # Astro + React компоненты
│   ├── content/portfolio/      # Markdown-файлы работ (управляет CMS)
│   ├── data/site.json          # Тексты сайта (управляет CMS)
│   ├── layouts/Layout.astro
│   ├── pages/index.astro       # Главная
│   └── styles/global.css
├── public/
│   ├── admin/                  # Decap CMS
│   │   ├── index.html
│   │   └── config.yml          # ⚠️ Настроить под свой репозиторий
│   └── favicon.svg
├── docker/
│   └── nginx.conf              # Nginx внутри контейнера
├── Dockerfile                  # Multistage: Node build → nginx
├── docker-compose.yml          # site + oauth proxy
├── .env.example
└── README.md
```

---

## 🚀 Локальная разработка

```bash
# 1. Установка
npm install

# 2. Запуск dev-сервера (http://localhost:4321)
npm run dev

# 3. Сборка для продакшена
npm run build

# 4. Предпросмотр сборки
npm run preview
```

---

## 📝 Работа с контентом

### Три способа редактирования

| Что | Где лежит | Как редактировать |
|-----|-----------|-------------------|
| Тексты на главной (Hero, About, Services, Contact) | `src/data/site.json` | Через `/admin` или прямо в коде |
| Работы портфолио | `src/content/portfolio/*.md` | Через `/admin` или создать новый `.md` |
| Изображения | `src/assets/portfolio/` | Через `/admin` (аплоад) |

### Добавить новую работу вручную

Создайте `src/content/portfolio/new-work.md`:

```markdown
---
title: "Название проекта"
client: "Имя клиента"
category: "Reels"   # Reels | Stories | SMM | Branding
year: 2025
cover: "../../assets/portfolio/new-work.jpg"
description: "Короткое описание результата"
tags: ["Reels", "Fashion"]
featured: true
order: 7
---

Развёрнутое описание работы (поддерживает Markdown).
```

Положите обложку в `src/assets/portfolio/new-work.jpg` — готово.

---

## 🔐 Настройка Decap CMS (админка `/admin`)

Decap CMS хранит контент в git — когда Veta редактирует текст через админку, она делает коммит в репозиторий на GitHub, а CI/CD пересобирает сайт.

### Шаг 1. Положить проект в GitHub

```bash
cd veta-portfolio
git init
git add .
git commit -m "Initial commit"
git branch -M main
# Создайте репозиторий на github.com и добавьте remote:
git remote add origin git@github.com:YOUR_USER/veta-portfolio.git
git push -u origin main
```

### Шаг 2. Создать GitHub OAuth App

1. Зайдите на https://github.com/settings/developers
2. **New OAuth App**
3. Заполните:
   - **Application name**: `Veta Portfolio CMS`
   - **Homepage URL**: `https://vetasergeeva.com` (ваш домен)
   - **Authorization callback URL**: `https://vetasergeeva.com/callback`
4. Нажмите **Register application**
5. Скопируйте **Client ID**
6. Нажмите **Generate a new client secret** и скопируйте его

### Шаг 3. Отредактировать `public/admin/config.yml`

Замените плейсхолдеры на реальные значения:

```yaml
backend:
  name: github
  repo: your-github-user/veta-portfolio   # ← ваш репозиторий
  branch: main
  base_url: https://vetasergeeva.com      # ← ваш домен
  auth_endpoint: /api/auth

site_url: https://vetasergeeva.com
display_url: https://vetasergeeva.com
```

Закоммитьте изменения:

```bash
git add public/admin/config.yml
git commit -m "Configure Decap CMS"
git push
```

---

## 🐳 Деплой на VPS (Debian 13)

Предположения:
- VPS с Debian 13, SSH-доступ по ключу
- Домен уже ведёт на IP сервера (A-запись)
- Пользователь с sudo-правами (не работаем под root)

### Шаг 1. Подготовка сервера

```bash
ssh user@your-server

# Обновить систему
sudo apt update && sudo apt upgrade -y

# Установить Docker + Compose plugin
sudo apt install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Добавить пользователя в группу docker (чтоб без sudo)
sudo usermod -aG docker $USER
newgrp docker

# Проверить
docker --version
docker compose version
```

### Шаг 2. Установить nginx (хостовый) + certbot

Nginx на хосте нужен как **reverse proxy** с SSL. Внутри контейнера тоже nginx, но он слушает только `127.0.0.1:8080`.

```bash
sudo apt install -y nginx certbot python3-certbot-nginx ufw

# Firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

### Шаг 3. Склонировать проект и настроить `.env`

```bash
cd /opt
sudo mkdir veta-portfolio && sudo chown $USER:$USER veta-portfolio
cd veta-portfolio

git clone git@github.com:YOUR_USER/veta-portfolio.git .

# Создать .env из шаблона
cp .env.example .env
nano .env
```

Заполните `.env`:

```env
DOMAIN=vetasergeeva.com
OAUTH_CLIENT_ID=Iv1.xxxxxxxxxxxx
OAUTH_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Шаг 4. Собрать и запустить контейнеры

```bash
docker compose build
docker compose up -d

# Проверить статус
docker compose ps
docker compose logs -f
```

Сайт должен быть доступен на `http://127.0.0.1:8080` (изнутри сервера):

```bash
curl -I http://127.0.0.1:8080
# HTTP/1.1 200 OK
```

### Шаг 5. Настроить nginx на хосте

```bash
sudo nano /etc/nginx/sites-available/vetasergeeva.com
```

Вставьте:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name vetasergeeva.com www.vetasergeeva.com;

    # certbot валидация
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;

        # Для WebSocket/OAuth callback
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    client_max_body_size 20M;
}
```

Активировать и проверить:

```bash
sudo ln -s /etc/nginx/sites-available/vetasergeeva.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Шаг 6. Получить SSL через Let's Encrypt

```bash
sudo certbot --nginx -d vetasergeeva.com -d www.vetasergeeva.com
```

Certbot:
- проверит владение доменом
- получит сертификат
- **автоматически** допишет 443-й блок в nginx-конфиг
- настроит редирект 80 → 443
- добавит systemd-таймер для автообновления

Проверить автообновление:

```bash
sudo certbot renew --dry-run
```

Сертификаты обновляются автоматически каждые ~60 дней через `systemctl list-timers | grep certbot`.

### Шаг 7. Готово 🎉

Откройте `https://vetasergeeva.com` — сайт работает по HTTPS.
Откройте `https://vetasergeeva.com/admin` — войдите через GitHub.

---

## 🔄 Обновление контента

### Сценарий A: Veta редактирует через `/admin`

1. Заходит на `https://vetasergeeva.com/admin`
2. Логинится через GitHub (нужен доступ к репозиторию)
3. Меняет текст / добавляет работу / загружает картинку
4. Нажимает **Publish** — Decap делает коммит в `main`
5. **Нужен пересбор сайта** — см. авто-деплой ниже

### Сценарий B: вы правите код локально

```bash
# На локальной машине
git add .
git commit -m "Update content"
git push

# На сервере
cd /opt/veta-portfolio
git pull
docker compose build site
docker compose up -d site
```

### 🤖 Авто-деплой через webhook (опционально, но удобно)

Чтобы Veta не ждала вашего ручного пересбора после каждого изменения в CMS, настройте webhook.

**Простой вариант** — git-hook + systemd path unit:

Создайте `/opt/veta-portfolio/deploy.sh`:

```bash
#!/usr/bin/env bash
set -e
cd /opt/veta-portfolio
git pull --ff-only
docker compose build site
docker compose up -d site
docker image prune -f
```

```bash
chmod +x /opt/veta-portfolio/deploy.sh
```

**Или** используйте GitHub Actions с SSH-деплоем — добавьте `.github/workflows/deploy.yml` (пример можно нагуглить по запросу "github actions ssh deploy").

**Или** — самое простое — раз в 5 минут `git pull + rebuild` через cron:

```bash
crontab -e
# Добавить:
*/5 * * * * /opt/veta-portfolio/deploy.sh >> /var/log/veta-deploy.log 2>&1
```

---

## 🎨 Дизайн-токены

| Цвет | HEX | Использование |
|------|-----|--------------|
| `bg` | `#F5F3EE` | Основной фон (тёплый off-white) |
| `bg-secondary` | `#E8E4DC` | Вторичные блоки |
| `ink` | `#0A0A0A` | Основной текст |
| `ink-muted` | `#6B6B6B` | Подписи, мета |
| `accent` | `#FF5B4A` | Акценты, CTA, hover |
| `accent-soft` | `#FFE4DF` | Мягкие акценты, блобы |

**Шрифты** (Google Fonts, подключены в `global.css`):
- `Fraunces` — display (имя, крупные заголовки, italic)
- `Inter Tight` — body
- `JetBrains Mono` — мета-текст, uppercase-подписи

**Анимации:**
- Smooth scroll — [Lenis](https://github.com/darkroomengineering/lenis)
- Parallax на карточках портфолио — GSAP ScrollTrigger
- Magnetic cursor + custom cursor — vanilla React + GSAP
- Reveal при скролле — IntersectionObserver + CSS

---

## 🛠 Troubleshooting

### Контейнер не стартует
```bash
docker compose logs site
docker compose logs decap-oauth
```

### Decap CMS показывает «API rate limit exceeded»
Это GitHub лимитит запросы. Обычно проходит само через час. Можно увеличить лимит, авторизовавшись через OAuth.

### После `git pull` картинки не обновились
Заставьте Docker пересобрать с нуля:
```bash
docker compose build --no-cache site
docker compose up -d site
```

### SSL не выпускается certbot
Убедитесь, что DNS A-запись на домене указывает на IP сервера и порт 80 открыт:
```bash
sudo ufw status
dig +short vetasergeeva.com
```

### Хочу свой домен вместо `vetasergeeva.com`
Поменяйте во всех трёх местах:
1. `public/admin/config.yml` (поля `repo`, `base_url`, `site_url`, `display_url`)
2. `.env` (`DOMAIN=...`)
3. Конфиг nginx на хосте (`server_name ...`)

И не забудьте обновить **Authorization callback URL** в GitHub OAuth App.

---

## 📦 Что использовано

- [Astro 4](https://astro.build) — статический генератор
- [React 18](https://react.dev) — для интерактивных островов
- [Tailwind CSS 3](https://tailwindcss.com) — стили
- [GSAP + ScrollTrigger](https://greensock.com/gsap/) — анимации
- [Lenis](https://github.com/darkroomengineering/lenis) — smooth scroll
- [Decap CMS](https://decapcms.org/) — git-based админка
- [netlify-cms-oauth-provider-go](https://github.com/igk1972/netlify-cms-oauth-provider-go) — OAuth proxy
- Шрифты: Fraunces, Inter Tight, JetBrains Mono (Google Fonts)

---

## Лицензия

Частный проект. Используйте как хотите.
