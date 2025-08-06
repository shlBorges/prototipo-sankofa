# 📱 Sistema de Layout Adaptativo - Projeto Sankofa

## 🎯 **Funcionalidades Implementadas**

### **Detecção Inteligente de Dispositivo**
O sistema detecta automaticamente:
- ✅ **Largura e altura da tela**
- ✅ **Orientação (portrait/landscape)**
- ✅ **Tipo de dispositivo (mobile/tablet/desktop)**
- ✅ **Capacidade de toque**
- ✅ **Densidade de pixels**

### **Layouts Adaptativos por Contexto**

#### 📱 **Mobile Small (< 480px)**
```
Layout: 1 coluna
Cards: Compactos
Espaçamento: Reduzido
Extras: Progresso + Swipe
```

#### 📱 **Mobile Portrait (480-768px)**
```
Layout: 1 coluna
Cards: Médios
Espaçamento: Normal
Extras: Progresso + Swipe
```

#### 📱 **Mobile Landscape (< 768px)**
```
Layout: 2 colunas (se > 2 cards)
Cards: Pequenos
Espaçamento: Reduzido
Extras: Swipe
```

#### 📋 **Tablet Portrait (768-1200px)**
```
Layout: 1-2 colunas (baseado em quantidade)
Cards: Médios
Espaçamento: Normal
Extras: Swipe
```

#### 📋 **Tablet Landscape (768-1200px)**
```
Layout: 2 colunas
Cards: Médios
Espaçamento: Normal
```

#### 🖥️ **Desktop (> 1200px)**
```
Layout: 2-3 colunas (baseado em quantidade e largura)
Cards: Grandes
Espaçamento: Espaçoso
```

---

## 🔧 **Funcionalidades Dinâmicas**

### **1. Indicador de Progresso**
- Aparece em dispositivos mobile
- Dots clicáveis para navegação
- Contador "X de Y"
- Atualização automática no scroll

### **2. Navegação por Swipe**
- Habilitada em dispositivos touch
- Swipe vertical para navegar entre cards
- Threshold configurável para evitar toques acidentais
- Scroll suave entre cards

### **3. Detecção de Scroll Inteligente**
- Intersection Observer para performance
- Atualiza progresso automaticamente
- Detecta card atualmente visível

### **4. Responsividade em Tempo Real**
- Listener para mudanças de orientação
- Recalcula layout automaticamente
- Debounce para evitar múltiplas chamadas
- Reinicializa animações AOS

---

## 🎨 **Classes CSS Geradas Dinamicamente**

### **Colunas:**
- `.layout-1col` - Uma coluna
- `.layout-2col` - Duas colunas  
- `.layout-3col` - Três colunas

### **Tamanhos:**
- `.size-compact` - Cards compactos
- `.size-medium` - Cards médios
- `.size-large` - Cards grandes

### **Espaçamentos:**
- `.spacing-tight` - Espaçamento reduzido
- `.spacing-normal` - Espaçamento normal
- `.spacing-spacious` - Espaçamento espaçoso

### **Modos:**
- `.compact-mode` - Modo compacto para mobile

---

## 🚀 **Como Usar**

### **Inicialização Automática:**
```javascript
// Já integrado nas funções de inicialização
initContentPage(); // Inicializa automaticamente o sistema
```

### **Aplicação Manual:**
```javascript
// Aplicar layout para X cards
AdaptiveLayoutManager.applyLayout(5);

// Navegar para card específico
AdaptiveLayoutManager.scrollToCard(2);

// Detectar dispositivo atual
const device = AdaptiveLayoutManager.detectDevice();
```

---

## 📊 **Lógica de Decisão**

```javascript
// Exemplo da lógica adaptativa
if (device.isMobileSmall) {
    layout = { columns: 1, cardSize: 'compact', enableSwipe: true };
} else if (device.isMobileLandscape && cardCount > 2) {
    layout = { columns: 2, cardSize: 'small', enableSwipe: true };
} else if (device.isDesktop && cardCount > 4) {
    layout = { columns: 3, cardSize: 'large' };
}
```

---

## 🔄 **Benefícios**

1. **UX Otimizada**: Cada dispositivo recebe o melhor layout possível
2. **Performance**: Intersection Observer + debounce para eficiência
3. **Acessibilidade**: Mantém navegação por teclado e foco
4. **Flexibilidade**: Adapta-se ao número variável de cards
5. **Manutenibilidade**: Sistema modular e extensível

---

## 🎯 **Exemplo de Comportamento**

### **iPhone (375x667) Portrait:**
- 1 coluna, cards médios, indicador de progresso, swipe habilitado

### **iPhone (667x375) Landscape:**
- 2 colunas (se >2 cards), cards pequenos, swipe habilitado

### **iPad (768x1024) Portrait:**
- 1-2 colunas baseado na quantidade, cards médios

### **Desktop (1920x1080):**
- 2-3 colunas baseado na quantidade, cards grandes

---

**🌟 Resultado: Uma experiência fluida e otimizada em qualquer dispositivo!**
