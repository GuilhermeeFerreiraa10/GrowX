document.addEventListener('DOMContentLoaded', () => {
    const timeline = document.getElementById('timeline');
    const inputTweet = document.getElementById('tweet-content');
    const btnTweetar = document.getElementById('btn-tweetar');
    const btnTema = document.getElementById('theme-toggle');
  const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3333' 
    : 'https://growtweeter.vercel.app/';


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
                console.log("✅ Usuário sincronizado:", user.id);
            }
        } catch (e) {
            console.error("❌ Erro na sincronização, usando backup...");
            user = JSON.parse(localStorage.getItem('user')) || user;
        }
        carregarTweets();
    }

    window.curtir = async (tweetId) => {
        if (["1", "2", "3"].includes(tweetId)) {
            const t = feedPadrao.find(x => x.id === tweetId);
            t.euCurti = !t.euCurti;
            t.likes += t.euCurti ? 1 : -1;
            renderizarFeed();
            return; 
        }

        try {
            const res = await fetch(`${API_URL}/like`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: user.id, 
                    tweetId: tweetId 
                })
            });

            if (res.ok) {
                await carregarTweets(); 
            }
        } catch (error) {
            console.error("❌ Erro ao processar like no servidor");
        }
    };

    window.seguir = async (followingId) => {
    if (followingId === user.id) return alert("Você não pode seguir a si mesmo!");

    try {
        const res = await fetch(`${API_URL}/follow`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                followerId: user.id,
                followingId: followingId 
            })
        });

        if (res.ok) {
            console.log("✅ Agora você segue este usuário!");
            await carregarTweets();
        } else {
            const erro = await res.json();
            alert(erro.error);
        }
    } catch (error) {
        console.error("❌ Erro ao seguir usuário");
    }
};

    if (btnTweetar) {
        btnTweetar.onclick = async () => {
            const texto = inputTweet.value.trim();
            if (!texto || !user.id) {
                alert("Aguarde a sincronização ou verifique o usuário.");
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
            } catch (e) { console.error("❌ Erro ao postar tweet"); }
        };
    }

    async function carregarTweets() {
        try {
            const res = await fetch(`${API_URL}/tweet`);
            const tweetsBanco = await res.json();
            
            const feedDaAPI = tweetsBanco.map(t => ({
                id: t.id,
                nome: t.user?.name || "Guilherme",
                arroba: t.user?.username || "guilhermee",
                texto: t.content,
                foto: "/assets/fotoDePerfil.jpg",
                likes: t.likes ? t.likes.length : 0,

                euCurti: t.likes ? t.likes.some(l => l.userId === user.id) : false,
                comments: 0
            }));

            feed = [...feedDaAPI, ...feedPadrao];
            renderizarFeed();
        } catch (e) {
            feed = feedPadrao;
            renderizarFeed();
        }
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
                        <button class="btn-action">
                            💬 <span>${t.comments}</span>
                        </button>
                    </div>
                </div>
            </div>`).join('');
    }

    // --- TEMA E INICIALIZAÇÃO ---
    const aplicarTema = (tema) => {
        document.documentElement.classList.toggle('dark-mode', tema === 'dark');
        if (btnTema) btnTema.textContent = tema === 'dark' ? '🌙' : '☀️';
    };
    if (btnTema) {
        btnTema.onclick = () => {
            const novoTema = document.documentElement.classList.contains('dark-mode') ? 'light' : 'dark';
            localStorage.setItem('theme', novoTema);
            aplicarTema(novoTema);
        };
    }
    aplicarTema(localStorage.getItem('theme') || 'light');
    sincronizarUsuario();
});