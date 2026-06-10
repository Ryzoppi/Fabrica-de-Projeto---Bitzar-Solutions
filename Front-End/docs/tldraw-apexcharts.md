# Whiteboard com Tldraw + ApexCharts

## Visão geral

A ideia é integrar o **Tldraw** como um canvas infinito onde os gráficos gerados pela IA (via ApexCharts) podem ser posicionados, movidos, redimensionados e organizados livremente — similar ao Figma ou ao Stitch AI.

Quando a IA responde com um conjunto de gráficos no chat, o usuário pode abrir o whiteboard e ver todos eles como shapes independentes no canvas, com total liberdade para reorganizá-los.

---

## Stack

| Biblioteca | Função |
|---|---|
| `tldraw` | Canvas infinito, pan/zoom, drag, resize, seleção |
| `react-apexcharts` | Renderização dos gráficos dentro dos shapes |
| `@dnd-kit/*` | Drag & drop no chat (fora do whiteboard) |
| `react-router-dom` | Navegação entre Chat e Whiteboard |

---

## Arquitetura

```
src/
├── views/
│   ├── Chat/
│   │   ├── Chat.jsx                  # Tela principal do chatbot
│   │   └── components/
│   │       ├── ChatMessages/
│   │       │   ├── ChartsBlock/      # Grid de gráficos no chat
│   │       │   └── ChartCard/        # Card individual com drag handle
│   │       └── ...
│   └── Whiteboard/
│       ├── Whiteboard.jsx            # Tela do canvas infinito
│       └── shapes/
│           └── ChartShapeUtil.jsx    # Custom shape do ApexCharts
```

---

## Como funciona

### 1. Resposta da IA

A IA retorna um array de objetos de gráfico no seguinte formato:

```js
[
  {
    id: 'chart-1',
    title: 'Performance Jan–Abr',
    type: 'bar',
    options: {
      chart: { background: 'transparent', toolbar: { show: false } },
      xaxis: { categories: ['Jan', 'Fev', 'Mar', 'Abr'] },
      colors: ['#00E39E'],
      tooltip: { theme: 'dark' },
    },
    series: [{ name: 'Performance', data: [44, 55, 41, 67] }],
  },
]
```

### 2. Exibição no chat

Os gráficos aparecem no chat dentro de um `ChartsBlock` em grid responsivo (máximo 4 por linha), com:

- **Drag handle** (`DragIndicatorIcon`) para reordenar via `@dnd-kit`
- **Botão de configuração** (`SettingsIcon`) para trocar o tipo do gráfico via modal

### 3. Abertura no Whiteboard

Um botão no `ChartsBlock` serializa os dados dos gráficos no `sessionStorage` e navega para `/whiteboard`:

```js
const handleOpenWhiteboard = (charts) => {
  sessionStorage.setItem('whiteboard-charts', JSON.stringify(charts))
  navigate('/whiteboard')
}
```

### 4. Renderização no Canvas

O `Whiteboard.jsx` lê os dados do `sessionStorage` e, no `onMount` do Tldraw, cria um shape por gráfico posicionado automaticamente em grid:

```js
charts.forEach((chartData, index) => {
  editor.createShape({
    id: createShapeId(chartData.id),
    type: 'chart',
    x: 100 + (index % 3) * 560,
    y: 100 + Math.floor(index / 3) * 400,
    props: { w: 500, h: 350, chartData },
  })
})
```

---

## ChartShapeUtil

O custom shape estende `BaseBoxShapeUtil` do Tldraw e renderiza o ApexCharts dentro de um `HTMLContainer`:

```jsx
import { BaseBoxShapeUtil, HTMLContainer } from 'tldraw'
import Chart from 'react-apexcharts'

export class ChartShapeUtil extends BaseBoxShapeUtil {
  static type = 'chart'

  getDefaultProps() {
    return {
      w: 500,
      h: 350,
      chartData: { /* ... */ },
    }
  }

  component(shape) {
    const { chartData, w, h } = shape.props

    return (
      <HTMLContainer
        style={{
          width: w,
          height: h,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid #3F3F3F',
          borderRadius: 8,
          padding: 8,
          overflow: 'hidden',
          pointerEvents: 'all', // permite hover nos tooltips do ApexCharts
        }}
      >
        <Chart
          key={`${chartData.id}-${chartData.type}`}
          options={chartData.options}
          series={chartData.series}
          type={chartData.type}
          width={w - 16}
          height={h - 16}
        />
      </HTMLContainer>
    )
  }

  indicator(shape) {
    return <rect width={shape.props.w} height={shape.props.h} rx={8} fill="none" />
  }
}
```

> `pointerEvents: 'all'` é essencial — sem ele o Tldraw captura todos os eventos do mouse e os tooltips do ApexCharts não funcionam.

---

## Conversão de tipos de gráfico

Ao trocar o tipo via modal, o `series` precisa ser adaptado:

| De | Para | Transformação |
|---|---|---|
| `bar / line / area` | `pie / donut` | `series.flatMap(s => s.data)` → array de números |
| `pie / donut` | `bar / line / area` | `[{ name: 'Série', data: series }]` → array de objetos |
| `bar / line / area` | `bar / line / area` | Nenhuma — só atualiza `type` |

---

## Persistência

O layout do whiteboard é salvo automaticamente no `localStorage` via `persistenceKey`:

```jsx
<Tldraw
  shapeUtils={customShapeUtils}
  onMount={handleMount}
  persistenceKey="dashboard-whiteboard"
/>
```

Ao reabrir o whiteboard, os shapes estarão exatamente onde o usuário os deixou.

---

## Licença do Tldraw

> ⚠️ O Tldraw é gratuito para uso em desenvolvimento e projetos não-comerciais. **Uso em produção comercial requer licença paga.** Consulte [tldraw.dev](https://tldraw.dev) para detalhes.

---

## Próximos passos sugeridos

- [ ] Adicionar botão "Abrir no Whiteboard" no `ChartsBlock` do chat
- [ ] Criar toolbar customizada no Tldraw para adicionar novos gráficos ao canvas
- [ ] Implementar um painel lateral no whiteboard para editar o tipo/dados de cada shape selecionado
- [ ] Avaliar `@tldraw/sync` para colaboração em tempo real entre usuários
- [ ] Considerar exportar o canvas como imagem PNG via `editor.toImage()`
