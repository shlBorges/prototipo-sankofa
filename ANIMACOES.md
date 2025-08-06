# 🎨 Guia de Animações - Projeto Sankofa

## Animações Implementadas

### 🎯 **Bibliotecas Usadas**
- **Animate.css** - Para animações CSS predefinidas
- **AOS (Animate On Scroll)** - Para animações no scroll
- **CSS Custom Properties** - Para consistência visual
- **Micro-animações customizadas** - Para interações específicas

---

## 📋 **Como Usar as Animações**

### **1. Animações AOS (Já implementadas)**
```html
<!-- Cards de conteúdo aparecem conforme o scroll -->
<div class="content-box" data-aos="fade-up" data-aos-delay="100">
  <!-- conteúdo -->
</div>

<!-- Opções de atividades com zoom -->
<div class="opcao-card" data-aos="zoom-in" data-aos-delay="200">
  <!-- conteúdo -->
</div>
```

### **2. Animações Animate.css**
```html
<!-- Para destacar elementos importantes -->
<div class="animate__animated animate__pulse">
  Elemento que pulsa
</div>

<!-- Para entradas dramáticas -->
<div class="animate__animated animate__bounceInDown">
  Entrada com bounce
</div>
```

### **3. Classes Customizadas (Prontas para uso)**
```html
<!-- Hover suave em botões -->
<button class="btn-smooth-hover">Botão</button>

<!-- Cards com glassmorphism -->
<div class="glass-card">Card transparente</div>

<!-- Elementos com foco acessível -->
<div class="focus-accessible">Elemento focável</div>
```

---

## 🎨 **Efeitos Visuais Implementados**

### **Glassmorphism**
- Cards com efeito de vidro fosco
- Backdrop-filter com blur
- Gradientes sutis

### **Micro-animações**
- Transformações suaves no hover
- Escalas e translações
- Sombras dinâmicas

### **Acessibilidade**
- Respeita `prefers-reduced-motion`
- Focus states visíveis
- Navegação por teclado

---

## 🔧 **Personalização**

### **Variáveis CSS Disponíveis**
```css
:root {
  --primary-color: #702c05;
  --transition-smooth: 0.3s ease;
  --shadow-lg: 0 6px 20px rgba(0,0,0,0.15);
  --border-radius-lg: 15px;
}
```

### **Modificar Durações**
```javascript
// No JavaScript (já implementado)
AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
});
```

---

## 🚀 **Performance**

- ✅ Todas as animações são otimizadas para GPU
- ✅ Respeita preferências de movimento do usuário
- ✅ Lazy loading de animações no scroll
- ✅ Compatível com GitHub Pages

---

## 🌟 **Próximos Passos (Opcionais)**

1. **Particles.js** para background da nuvem de palavras
2. **Lottie** para micro-animações vetoriais
3. **GSAP** para animações mais complexas (se necessário)

---

**💡 Dica**: Todas as animações já estão configuradas para funcionar perfeitamente no GitHub Pages!
