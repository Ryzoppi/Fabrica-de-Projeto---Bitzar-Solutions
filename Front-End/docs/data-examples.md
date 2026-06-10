## Exemplo de dado recebido da API

```js
const response = [
  {
    data: {
      role: 'ai', // injetado pelo front
      charts: [{}, {}, {}], // se estiver vazio, é apenas uma resposta de texto da IA
      message: '',
    },
  },
]
```

## Exemplo de incorporação de dados de gráficos recebidos da API

- Provavelmente a estrutura já estará em um helper e apenas receberá: { title, type, id?, categories, series }

```js
const incomingCharts = [
  {
    id: 'chart-1',
    title: 'Performance Jan–Abr',
    type: 'bar',
    options: {
      chart: {
        id: 'bar-1',
        background: 'transparent',
        theme: { mode: 'dark' },
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      tooltip: {
        theme: 'dark',
      },
      legend: {
        labels: {
          colors: '#aaaaaa',
        },
      },
      xaxis: {
        categories: ['Jan', 'Fev', 'Mar', 'Abr'],
        labels: {
          style: {
            colors: '#aaaaaa',
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#aaaaaa',
          },
        },
      },
      colors: ['#00E39E'],
    },
    series: [{ name: 'Performance', data: [44, 55, 41, 67] }],
  },
  {
    id: 'chart-2',
    title: 'Receita mensal',
    type: 'line',
    options: {
      chart: {
        id: 'line-1',
        background: 'transparent',
        theme: { mode: 'dark' },
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      tooltip: {
        theme: 'dark',
      },
      legend: {
        labels: {
          colors: '#aaaaaa',
        },
      },
      xaxis: {
        categories: ['Jan', 'Fev', 'Mar', 'Abr'],
        labels: {
          style: {
            colors: '#aaaaaa',
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#aaaaaa',
          },
        },
      },
      colors: ['#60A5FA'],
    },
    series: [{ name: 'Receita', data: [12000, 15000, 11000, 18000] }],
  },
]
```
