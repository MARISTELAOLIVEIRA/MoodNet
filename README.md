# MoodNet — Etapa A
### Reconhecimento de Emoções com Redes Neurais Convolucionais

> Projeto educacional desenvolvido com ❤️ pela **Prof.ª Maristela**  
> Disciplina de **Deep Learning** · Faculdade de Tecnologia e Inovação Senac DF

---

## O que é o MoodNet?

O MoodNet é um sistema web interativo que usa uma **rede neural convolucional (CNN)** para identificar a emoção expressa em um emoji simples desenhado à mão pelo usuário.

O aluno desenha um rosto com olhos e boca na tela, clica em **Analisar**, e a IA responde com:
- a emoção classificada (**feliz**, **triste** ou **neutro**);
- o percentual de confiança da predição;
- as probabilidades de cada classe visualmente.

---

## Conceitos de Deep Learning abordados

| Conceito | Onde aparece no projeto |
|---|---|
| Rede Neural Convolucional (CNN) | Modelo em `train_model.py` |
| Camadas Conv2D + MaxPooling | Extração de features da imagem |
| Flatten + Dense + Dropout | Classificação final |
| Softmax | Saída com probabilidades por classe |
| Categorical Crossentropy | Função de perda |
| Adam Optimizer | Otimização do gradiente |
| Data Augmentation (rotação, jitter) | `create_demo_dataset.py` |
| Pré-processamento de imagem | `model_utils.py` e `train_model.py` |
| Train/Validation Split | Pastas `data/train` e `data/val` |
| Inferência em tempo real | `app.py` + `model_utils.py` |

---

## Arquitetura da CNN

```
Entrada: imagem 28×28 pixels em escala de cinza (1 canal)

┌─────────────────────────────┐
│  Conv2D (32 filtros, 3×3)   │  ← detecta bordas e curvas
│  MaxPooling2D (2×2)         │  ← reduz dimensionalidade
├─────────────────────────────┤
│  Conv2D (64 filtros, 3×3)   │  ← detecta padrões complexos
│  MaxPooling2D (2×2)         │
├─────────────────────────────┤
│  Flatten                    │  ← transforma em vetor
│  Dense (128, ReLU)          │  ← aprendizado de alto nível
│  Dropout (0.3)              │  ← evita overfitting
│  Dense (64, ReLU)           │
│  Dropout (0.2)              │
├─────────────────────────────┤
│  Dense (3, Softmax)         │  ← saída: feliz / triste / neutro
└─────────────────────────────┘
```

---

## Fluxo completo do sistema

```
[Aluno desenha no canvas]
        ↓
[JavaScript captura como imagem PNG em base64]
        ↓
[Requisição POST /predict para o Flask]
        ↓
[model_utils.py: decodifica a imagem]
        ↓
[Pré-processamento: escala de cinza → inversão de cores
 → recorte do conteúdo → centralização → 28×28 px]
        ↓
[CNN faz a predição → vetor de 3 probabilidades]
        ↓
[Flask retorna JSON com emoção + confiança]
        ↓
[Interface exibe resultado e gráfico de barras]
```

---

## Por que pré-processar a imagem?

O modelo foi treinado com imagens 28×28 px, invertidas (traço branco em fundo preto) e centralizadas. Se a imagem enviada pelo usuário não passar pelo **mesmo pipeline**, o modelo recebe dados completamente diferentes dos que aprendeu — e erra muito.

Por isso `model_utils.py` e `train_model.py` usam a **mesma função** de pré-processamento:

1. Converte para escala de cinza
2. Inverte as cores (traço preto → branco)
3. Recorta apenas a região desenhada (remove margens vazias)
4. Centraliza em um canvas quadrado
5. Redimensiona para 28×28 com interpolação Lanczos
6. Normaliza os pixels para o intervalo [0, 1]

---

## Dataset sintético

Como não temos fotos reais de emojis desenhados, o `create_demo_dataset.py` gera automaticamente rostos simples com:

- **olhos** de tamanhos diferentes por emoção
- **boca** em arco para cima (feliz), para baixo (triste) ou reta (neutro)
- variações aleatórias de posição, espessura e rotação
- contorno do rosto presente em ~60% das imagens

| Split | Imagens por classe | Total |
|---|---|---|
| Treino | 1.200 | 3.600 |
| Validação | 300 | 900 |

---

## Estrutura do projeto

```
moodnet/
├── app.py                  # Servidor Flask (rotas da API e UI)
├── model_utils.py          # Pré-processamento e inferência
├── train_model.py          # Definição e treino da CNN
├── create_demo_dataset.py  # Gerador de dataset sintético
├── requirements.txt        # Dependências Python
├── data/
│   ├── train/
│   │   ├── feliz/
│   │   ├── triste/
│   │   └── neutro/
│   └── val/
│       ├── feliz/
│       ├── triste/
│       └── neutro/
├── model/
│   └── moodnet_stage_a.keras
├── media/
│   ├── logo.png
│   └── memoji.png
├── static/
│   ├── css/style.css
│   └── js/app.js
└── templates/
    └── index.html
```

---

## Como executar

### 1. Criar e ativar o ambiente virtual

```bash
python3 -m venv .venv
```

macOS / Linux:
```bash
source .venv/bin/activate
```

Windows:
```bash
.venv\Scripts\activate
```

### 2. Instalar as dependências

```bash
pip install -r requirements.txt
```

### 3. Gerar o dataset sintético

```bash
python3 create_demo_dataset.py
```

### 4. Treinar o modelo

```bash
python3 train_model.py
```

### 5. Iniciar o servidor

```bash
python3 app.py
```

Acesse em: **http://127.0.0.1:5000**

---

## Roteiro sugerido para a aula

1. **Demonstração ao vivo** — rodar o sistema e desenhar exemplos das 3 emoções
2. **Fluxo de dados** — percorrer o diagrama de fluxo acima com a turma
3. **Dataset** — abrir `create_demo_dataset.py` e mostrar como os rostos são gerados
4. **Arquitetura** — mostrar `train_model.py` e discutir cada camada da CNN
5. **Pré-processamento** — mostrar por que treino e inferência usam o mesmo pipeline
6. **Experimentar** — pedir para os alunos desenharem e observar as probabilidades
7. **Desafios** — propor melhorias (veja abaixo)

---

## Desafios para os alunos

- [ ] Adicionar **histórico** dos últimas 5 previsões na interface
- [ ] Permitir ajuste do **tamanho do pincel** na área de desenho
- [ ] Adicionar **upload de imagem** além do desenho manual
- [ ] Implementar a **Etapa B** com 5 emoções (animado, surpreso, etc.)
- [ ] Comparar o desempenho da **CNN vs MLP** no mesmo dataset
- [ ] Coletar **desenhos reais** dos colegas para retreinar o modelo
- [ ] Adicionar **early stopping** no treino para evitar overfitting
- [ ] Exportar o modelo para **TensorFlow.js** e rodar 100% no navegador

---

## Dependências

| Biblioteca | Versão | Papel |
|---|---|---|
| Flask | 3.1.0 | Servidor web e API REST |
| TensorFlow | 2.19.0 | Definição e treino da CNN |
| Pillow | 11.0.0 | Manipulação de imagens |
| NumPy | 2.1.3 | Operações numéricas |
