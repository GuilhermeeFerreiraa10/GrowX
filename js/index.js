document.addEventListener('DOMContentLoaded', () => {
    const timeline = document.getElementById('timeline');
    const inputTweet = document.getElementById('tweet-content');
    const btnTweetar = document.getElementById('btn-tweetar');
    const btnTema = document.getElementById('theme-toggle');
    
    let user = JSON.parse(localStorage.getItem('user')) || { id: 'b5a6914f-6c3d-4b1f-bb1f-0a316362e2ed', username: 'Guilherme' };
    const API_URL = 'https://growtweet.vercel.app'; 
    let feed = [];

    const aplicarTema = (tema) => {
        if (tema === 'dark') {
            document.documentElement.classList.add('dark-mode');
            if (btnTema) btnTema.textContent = '🌙';
        } else {
            document.documentElement.classList.remove('dark-mode');
            if (btnTema) btnTema.textContent = '☀️';
        }
    };

    if (btnTema) {
        btnTema.onclick = () => {
            const novoTema = document.documentElement.classList.contains('dark-mode') ? 'light' : 'dark';
            localStorage.setItem('theme', novoTema);
            aplicarTema(novoTema);
        };
    }
    aplicarTema(localStorage.getItem('theme') || 'light');

    async function carregarTweets() {
        try {
            const res = await fetch(`${API_URL}/tweet`);
            
            if (!res.ok) throw new Error("Erro ao buscar dados do servidor");
            
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
                    comments: t._count ? t._count.comments : 0, 
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

    window.comentar = async (tweetId) => {
        if (tweetId === "1" || tweetId === "2" || tweetId === "3") {
            return alert("Este é um tweet fixo, comente em um tweet real!");
        }

        const comentario = prompt("O que você está pensando?");
        if (!comentario) return;

        try {
            const response = await fetch(`${API_URL}/tweet/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: comentario,
                    userId: user.id,
                    tweetId: tweetId
                })
            });

            if (response.ok) {
                alert("Comentário enviado! 🚀");
                await carregarTweets();
            } else {
                alert("Erro ao enviar comentário no servidor.");
            }
        } catch (error) {
            console.error("Erro na comunicação:", error);
        }
    };

    let processandoLike = false;
    window.curtir = async (tweetId) => {
        if (processandoLike) return; 
        
        if (tweetId === "1" || tweetId === "2" || tweetId === "3") {
            const tweetFixo = feedPadrao.find(t => t.id === tweetId);
            if (tweetFixo) {
                tweetFixo.euCurti = !tweetFixo.euCurti;
                tweetFixo.likes += tweetFixo.euCurti ? 1 : -1;
                renderizarFeed();
                return;
            }
        }

        processandoLike = true;
        try {
            await fetch(`${API_URL}/tweet/like`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, tweetId: tweetId })
            });
            await carregarTweets(); 
        } catch (error) {
            console.error("Erro ao curtir:", error);
        } finally {
            processandoLike = false; 
        }
    };
    if (btnTweetar) {
        btnTweetar.onclick = async () => {
            const texto = inputTweet.value.trim();
            if (!texto || !user.id) return;

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
                console.error("Erro ao enviar:", error);
            }
        };
    }
    window.excluirTweet = async (id) => {
        if (!confirm("Deseja apagar este tweet permanentemente?")) return;
        try {
            const res = await fetch(`${API_URL}/tweet/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert("Tweet removido! ✨");
                await carregarTweets();
            }
        } catch (e) { alert("Erro ao excluir."); }
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
                        <button onclick="comentar('${t.id}')" class="btn-action" style="background:none; border:none; cursor:pointer;">
                            💬 <span>${t.comments}</span>
                        </button>
                    </div>
                </div>
            </div>`).join('');
    }

    carregarTweets();
});