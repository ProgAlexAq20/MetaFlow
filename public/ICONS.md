# MetaFlow Icons

Este diretório deve conter os ícones do PWA nas seguintes dimensões:

## Ícones Necessários

### Básicos
- `icon-192x192.png` - 192x192 PNG (usado em shortcuts)
- `icon-512x512.png` - 512x512 PNG (usado como ícone principal)
- `icon-96x96.png` - 96x96 PNG (favicon)
- `favicon.ico` - 16x16 ICO (favicon tradicional)

### Maskable (para ícones adaptativos)
- `icon-maskable-192x192.png` - 192x192 PNG (maskable)
- `icon-maskable-512x512.png` - 512x512 PNG (maskable)

### Screenshots (para Google Play)
- `screenshot-1.png` - 540x720 PNG (mobile)
- `screenshot-2.png` - 1280x720 PNG (desktop)

## Como Gerar

### Usando site online:
1. Vá em [favicon.io](https://favicon.io/)
2. Dependendo do que você quer:
   - Texto: Digite "MetaFlow"
   - Imagem: Faça upload de um logo
3. Customize o design
4. Download dos arquivos

### Usando GraphicsMagick/ImageMagick:
```bash
# Criar ícone 192x192
convert logo.png -resize 192x192 icon-192x192.png

# Criar ícone 512x512
convert logo.png -resize 512x512 icon-512x512.png

# Criar favicon.ico
convert icon-192x192.png -define icon:auto-resize favicon.ico
```

### Usando Figma:
1. Crie designs de 192x192 e 512x512
2. Exporte como PNG
3. Coloque neste diretório

## SVG Placeholder

Se precisar de um placeholder rápido, crie um arquivo SVG simples:

```svg
<!-- icon.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#38BDF8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="192" height="192" fill="url(#grad)"/>
  <circle cx="96" cy="96" r="60" fill="white" opacity="0.2"/>
  <text x="96" y="110" font-size="60" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial">MF</text>
</svg>
```

## Estrutura Final

```
public/
├── icon-192x192.png
├── icon-512x512.png
├── icon-96x96.png
├── icon-maskable-192x192.png
├── icon-maskable-512x512.png
├── favicon.ico
├── screenshot-1.png
├── screenshot-2.png
└── manifest.json
```

## Nota para GitHub Pages

Os ícones também funcionam com caminho relativo. Se o repo for `metaflow`:
```
https://seu-usuario.github.io/metaflow/icon-192x192.png
```

Isso é automaticamente tratado pelo manifest.json!

## Boas Práticas

1. **Tamanho de arquivo**: Comprima PNGs com tools como TinyPNG
2. **Formato**: Use PNG com transparência para ícones
3. **Safezone**: Para maskable, deixe 45% da imagem no centro
4. **Cores**: Use cores que combinem com seu tema
5. **Consistência**: Mantenha o mesmo design em todos os tamanhos
