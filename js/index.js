document.addEventListener('DOMContentLoaded', () => {
    const timeline = document.getElementById('timeline');
    const inputTweet = document.getElementById('tweet-content');
    const btnTweetar = document.getElementById('btn-tweetar');
    const btnTema = document.getElementById('theme-toggle');
    
    let user = JSON.parse(localStorage.getItem('user')) || { id: null, username: 'Visitante' };
    const API_URL = 'http://localhost:3333';
    let feed = [];

    // 1. CARREGAR TWEETS DO BANCO
    async function carregarTweets() {
        try {
            const res = await fetch(`${API_URL}/tweet`);
            const tweetsBanco = await res.json();

            const feedDaAPI = tweetsBanco.map(t => {
                const euCurti = t.likes ? t.likes.some(like => like.userId === user.id) : false;
                return {
                    id: t.id,
                    nome: t.user?.name || "Guilherme Ferreira",
                    arroba: t.user?.username || "ferreirauilhermee",
                    texto: t.content,
                    foto: "/assets/fotoDePerfil.jpg",
                    likes: t.likes ? t.likes.length : 0,
                    euCurti: euCurti, 
                    comments: 0,
                    podeExcluir: t.userId === user.id,
                    verificado: true
                };
            });

            feed = [...feedDaAPI, ...feedPadrao];
            renderizarFeed();
        } catch (e) {
            console.error("Erro ao carregar tweets:", e);
            feed = feedPadrao;
            renderizarFeed();
        }
    }

let processandoLike = false;
    window.curtir = async (tweetId) => {
        if (processandoLike) return; 

        // 1. TRATAMENTO PARA TWEETS FIXOS (Simulação)
        if (tweetId === "1" || tweetId === "2" || tweetId === "3") {
            const tweetFixo = feedPadrao.find(t => t.id === tweetId);
            if (tweetFixo) {
                tweetFixo.euCurti = !tweetFixo.euCurti;
                tweetFixo.likes += tweetFixo.euCurti ? 1 : -1;
                renderizarFeed();
                console.log("Simulação de like nos fixos ativa.");
                return;
            }
        }

        if (!user.id) return alert("Sincronize seu ID no console!");

        const tweetNoFeed = feed.find(t => t.id === tweetId);
        if (tweetNoFeed) {
            tweetNoFeed.euCurti = !tweetNoFeed.euCurti;
            tweetNoFeed.likes += tweetNoFeed.euCurti ? 1 : -1; 
            renderizarFeed();
        }

        processandoLike = true;

        try {
            const response = await fetch(`${API_URL}/tweet/like`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    tweetId: tweetId
                })
            });
            if (!response.ok) {
                alert("Erro ao processar curtida no servidor.");
                await carregarTweets(); 
            } 
            
        } catch (error) {
            console.error("Erro na comunicação:", error);
            await carregarTweets(); 
        } finally {
            processandoLike = false; 
        }
        try {
            const response = await fetch(`${API_URL}/tweet/like`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    tweetId: tweetId
                })
            });

            if (!response.ok) {
                await carregarTweets(); 
                alert("Erro ao processar curtida no servidor.");
            } else {
                await carregarTweets(); 
            }
        } catch (error) {
            console.error("Erro na comunicação:", error);
            await carregarTweets(); 
        } finally {
            processandoLike = false; 
        }
    };

    if (btnTweetar) {
        btnTweetar.onclick = async () => {
            const texto = inputTweet.value.trim();
            if (!texto) return;
            if (!user.id) return alert("Sincronize seu ID no console!");

            try {
                const response = await fetch(`${API_URL}/tweet`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: texto, userId: user.id })
                });

                if (response.ok) {
                    inputTweet.value = '';
                    await carregarTweets(); 
                }
            } catch (error) {
                alert("Erro ao enviar tweet.");
            }
        };
    }
    if (btnTema) {
        btnTema.onclick = () => {
            document.documentElement.classList.toggle('dark-mode');
            const isDark = document.documentElement.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            btnTema.textContent = isDark ? '🌙' : '☀️';
        };

        const temaSalvo = localStorage.getItem('theme');
        if (temaSalvo === 'light') {
            document.documentElement.classList.remove('dark-mode');
            btnTema.textContent = '☀️';
        }
    }
    window.excluirTweet = async (id) => {
        if (!confirm("Deseja apagar este tweet permanentemente?")) return;
        try {
            const res = await fetch(`${API_URL}/tweet/${id}`, { method: 'DELETE' });
            if (res.ok) await carregarTweets();
        } catch (e) {
            alert("Erro ao excluir.");
        }
    };

    const feedPadrao = [
        { id: '1', nome: "Blumhouse", arroba: "blumhouse", texto: "The future of FNAF is bright!", foto: "/assets/Blumhouse-logo.jpg", likes: 85400, euCurti: false, comments: 1200, podeExcluir: false, verificado: true },
        { id: '2', nome: "GrowDev", arroba: "growdevers", texto: "Vamos codar hoje?", foto: "/assets/growdev.png", likes: 1200, euCurti: false, comments: 45, podeExcluir: false, verificado: true },
        { id: '3', nome: "Dexter Moser", arroba: "michaelC.Hall", texto: "Open your eyes and look at what you did!", foto: "/assets/Michael C. Hall.jpg", likes: 1200, euCurti: false, comments: 45, podeExcluir: false, verificado: true }
    ];

    function renderizarFeed() {
        if (!timeline) return;
        timeline.innerHTML = feed.map(t => `
            <div class="tweet-card">
                <img src="${t.foto}" class="avatar" onerror="this.src='/assets/fotoDePerfil.jpg'">
                <div style="flex:1">
                    <div style="display:flex; justify-content:space-between; align-items: center;">
                        <strong>${t.nome} <span style="color:var(--text-secondary); font-weight:normal">@${t.arroba}</span></strong>
                        ${t.podeExcluir ? `<button onclick="excluirTweet('${t.id}')" style="background:transparent; border:none; cursor:pointer; font-size:1.2rem">🗑️</button>` : ''}
                    </div>
                    <p style="margin-top:5px">${t.texto}</p>
                    <div class="tweet-actions">
                        <button onclick="curtir('${t.id}')" class="btn-action" style="cursor:pointer; background:none; border:none; color: ${t.euCurti ? '#f4212e' : 'inherit'}">
                            ${t.euCurti ? '❤️' : '🤍'} <span>${t.likes.toLocaleString()}</span>
                        </button>
                        <button class="btn-action" style="background:none; border:none;">💬 <span>${t.comments}</span></button>
                    </div>
                </div>
            </div>`).join('');
    }

    carregarTweets();
});