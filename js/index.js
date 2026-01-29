document.addEventListener('DOMContentLoaded', () => {
    const timeline = document.getElementById('timeline');
    const inputTweet = document.getElementById('tweet-content');
    const btnTweetar = document.getElementById('btn-tweetar');
    const btnTema = document.getElementById('theme-toggle');

    const API_URL = 'https://growtweet.vercel.app/api';
    let feed = [];
    let user = { id: '', username: 'Guilherme' };

    async function sincronizarUsuario() {
        try {
            const res = await fetch(`${API_URL}/user`);
            const usuarios = await res.json();
            
            if (usuarios && usuarios.length > 0) {
                user.id = usuarios[0].id;
                user.username = usuarios[0].username || "Guilherme";
                localStorage.setItem('user', JSON.stringify(user));
                console.log("✅ Usuário sincronizado com o banco:", user.id);
            }
        } catch (e) {
            console.error("❌ Erro ao buscar usuário do banco, tentando localStorage...");
            user = JSON.parse(localStorage.getItem('user')) || user;
        }
        carregarTweets();
    }
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
            if (!res.ok) throw new Error("API Offline");
            const tweetsBanco = await res.json();
            const feedDaAPI = tweetsBanco.map(t => ({
                id: t.id,
                nome: t.user?.name || "Guilherme Ferreira",
                arroba: t.user?.username || "ferreirauilhermee",
                texto: t.content,
                foto: "/assets/fotoDePerfil.jpg",
                likes: t.likes ? t.likes.length : 0,
                euCurti: t.likes ? t.likes.some(l => l.userId === user.id) : false,
                comments: 0, 
                podeExcluir: t.userId === user.id
            }));
            feed = [...feedDaAPI, ...feedPadrao];
            renderizarFeed();
        } catch (e) {
            feed = feedPadrao;
            renderizarFeed();
        }
    }
    window.curtir = async (tweetId) => {
        if (["1", "2", "3"].includes(tweetId)) {
            const t = feedPadrao.find(x => x.id === tweetId);
            t.euCurti = !t.euCurti;
            t.likes += t.euCurti ? 1 : -1;
            renderizarFeed();
            return;
        }
        const tweetEncontrado = feed.find(t => t.id === tweetId);
        if (!tweetEncontrado) return;
        const rota = tweetEncontrado.euCurti ? '/tweet/unlike' : '/tweet/like';
        try {
            const res = await fetch(`${API_URL}${rota}`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, tweetId: tweetId })
            });
            if (res.ok) await carregarTweets(); 
        } catch (error) {
            console.error("Erro ao curtir");
        }
    };

    // --- TWEETAR ---
    if (btnTweetar) {
        btnTweetar.onclick = async () => {
            const texto = inputTweet.value.trim();
            if (!texto || !user.id) {
                alert("Aguarde a sincronização do usuário ou crie um usuário no Postman.");
                return;
            }
            try {
                const res = await fetch(`${API_URL}/tweet`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: texto, userId: user.id })
                });
                if (res.ok) {
                    inputTweet.value = '';
                    await carregarTweets();
                }
            } catch (e) { console.error("Erro ao postar"); }
        };
    }

    const feedPadrao = [
        { id: '1', nome: "Blumhouse", arroba: "blumhouse", texto: "The future of FNAF is bright!", foto: "/assets/Blumhouse-logo.jpg", likes: 85400, euCurti: false, comments: 1200 },
        { id: '2', nome: "GrowDev", arroba: "growdevers", texto: "Vamos codar hoje?", foto: "/assets/growdev.png", likes: 1200, euCurti: false, comments: 45 },
        { id: '3', nome: "Dexter Moser", arroba: "michaelC.Hall", texto: "Open your eyes and look at what you did!", foto: "/assets/Michael C. Hall.jpg", likes: 1200, euCurti: false, comments: 45 }
    ];

    function renderizarFeed() {
        if (!timeline) return;
        timeline.innerHTML = feed.map(t => `
            <div class="tweet-card">
                <img src="${t.foto}" class="avatar">
                <div style="flex:1">
                    <strong>${t.nome} <span style="color:gray; font-weight:normal">@${t.arroba}</span></strong>
                    <p style="margin-top:5px">${t.texto}</p>
                    <div class="tweet-actions">
                        <button onclick="curtir('${t.id}')" class="btn-action" style="color: ${t.euCurti ? '#f4212e' : 'inherit'}">
                            ${t.euCurti ? '❤️' : '🤍'} <span>${t.likes}</span>
                        </button>
                        <button onclick="alert('Comentários via Postman')" class="btn-action">
                            💬 <span>${t.comments}</span>
                        </button>
                    </div>
                </div>
            </div>`).join('');
    }

    // INICIALIZAÇÃO
    sincronizarUsuario();
});