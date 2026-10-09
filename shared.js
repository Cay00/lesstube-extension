/*
 * YouTube Customizer – shared definitions.
 * Single source of truth for: settings, popup layout, generated CSS,
 * import/export, redirects and the element-picker selector builder.
 * Loaded by popup.html and by the content script.
 */
(function (global) {
  "use strict";

  const LANGS = [
    ["en", "English"],
    ["pl", "Polski"],
    ["es", "Español"],
    ["pt", "Português"],
    ["de", "Deutsch"],
    ["fr", "Français"],
    ["ru", "Русский"],
    ["ja", "日本語"],
    ["zh", "中文"],
    ["ko", "한국어"],
    ["hi", "हिन्दी"],
    ["ar", "العربية"],
    ["id", "Bahasa Indonesia"],
  ];
  const LANG_CODES = LANGS.map(([code]) => code);

  // Extra UI languages, keyed by the English string. Missing keys fall back to English.
  const EXTRA = {
    "Home": { es: "Inicio", de: "Startseite", fr: "Accueil", pt: "Início", ru: "Главная" },
    "What you see when YouTube opens.": { es: "Lo que ves al abrir YouTube.", de: "Was du siehst, wenn YouTube startet.", fr: "Ce que vous voyez à l’ouverture de YouTube.", pt: "O que você vê ao abrir o YouTube.", ru: "То, что видно при открытии YouTube." },
    "Start": { es: "Inicio", de: "Start", fr: "Démarrage", pt: "Início", ru: "Старт" },
    "Open instead of Home": { es: "Abrir en lugar de Inicio", de: "Statt Startseite öffnen", fr: "Ouvrir à la place de l’accueil", pt: "Abrir em vez do Início", ru: "Открывать вместо главной" },
    "Subscriptions": { es: "Suscripciones", de: "Abos", fr: "Abonnements", pt: "Inscrições", ru: "Подписки" },
    "History": { es: "Historial", de: "Verlauf", fr: "Historique", pt: "Histórico", ru: "История" },
    "Library": { es: "Biblioteca", de: "Mediathek", fr: "Bibliothèque", pt: "Biblioteca", ru: "Библиотека" },
    "Watch later": { es: "Ver más tarde", de: "Später ansehen", fr: "À regarder plus tard", pt: "Assistir mais tarde", ru: "Смотреть позже" },
    "YouTube default": { es: "Predeterminado de YouTube", de: "YouTube-Standard", fr: "Réglage YouTube", pt: "Padrão do YouTube", ru: "Как в YouTube" },
    "Only when YouTube opens. The logo still opens Home.": { es: "Solo al abrir YouTube. El logo sigue abriendo Inicio.", de: "Nur beim Start von YouTube. Das Logo öffnet weiter die Startseite.", fr: "Uniquement à l’ouverture. Le logo ouvre toujours l’accueil.", pt: "Só ao abrir o YouTube. O logo ainda abre o Início.", ru: "Только при запуске YouTube. Логотип по-прежнему открывает главную." },
    "Videos per row": { es: "Vídeos por fila", de: "Videos pro Zeile", fr: "Vidéos par ligne", pt: "Vídeos por linha", ru: "Видео в ряду" },
    "Recommendations": { es: "Recomendaciones", de: "Empfehlungen", fr: "Recommandations", pt: "Recomendações", ru: "Рекомендации" },
    "Hide the recommended feed": { es: "Ocultar el feed recomendado", de: "Empfohlenen Feed ausblenden", fr: "Masquer le fil recommandé", pt: "Ocultar o feed recomendado", ru: "Скрыть рекомендуемую ленту" },
    "Leaves the Home page empty": { es: "Deja la página de inicio vacía", de: "Die Startseite bleibt leer", fr: "Laisse l’accueil vide", pt: "Deixa a página inicial vazia", ru: "Главная остаётся пустой" },
    "Hide playlists and mixes": { es: "Ocultar listas y mixes", de: "Playlists und Mixe ausblenden", fr: "Masquer playlists et mix", pt: "Ocultar playlists e mixes", ru: "Скрыть плейлисты и миксы" },
    "Hide ads in the feed": { es: "Ocultar anuncios del feed", de: "Werbung im Feed ausblenden", fr: "Masquer les pubs du fil", pt: "Ocultar anúncios do feed", ru: "Скрыть рекламу в ленте" },
    "Promoted tiles and banners only": { es: "Solo mosaicos y banners promocionados", de: "Nur beworbene Kacheln und Banner", fr: "Uniquement les tuiles et bannières sponsorisées", pt: "Apenas blocos e banners promovidos", ru: "Только промо-плитки и баннеры" },
    "Hide the topic chips bar": { es: "Ocultar la barra de categorías", de: "Themenleiste ausblenden", fr: "Masquer la barre de catégories", pt: "Ocultar a barra de categorias", ru: "Скрыть полосу категорий" },
    "Hide extra shelves": { es: "Ocultar secciones extra", de: "Zusätzliche Regale ausblenden", fr: "Masquer les rangées en plus", pt: "Ocultar seções extras", ru: "Скрыть лишние полки" },
    "News, posts, Shorts rows between videos": { es: "Noticias, publicaciones y filas de Shorts entre vídeos", de: "News, Beiträge und Shorts-Reihen zwischen Videos", fr: "Actus, posts et rangées Shorts entre les vidéos", pt: "Notícias, posts e fileiras de Shorts entre vídeos", ru: "Новости, посты и ряды Shorts между видео" },
    "Hide community posts": { es: "Ocultar publicaciones de la comunidad", de: "Community-Beiträge ausblenden", fr: "Masquer les posts de la communauté", pt: "Ocultar posts da comunidade", ru: "Скрыть посты сообщества" },
    "Turn off hover previews": { es: "Desactivar vistas previas al pasar el cursor", de: "Vorschau beim Darüberfahren aus", fr: "Désactiver l’aperçu au survol", pt: "Desativar prévias ao passar o mouse", ru: "Выключить превью при наведении" },
    "No video playing inside thumbnails": { es: "Sin vídeo reproduciéndose en las miniaturas", de: "Kein Video in den Miniaturansichten", fr: "Pas de lecture dans les miniatures", pt: "Sem vídeo tocando nas miniaturas", ru: "Без воспроизведения внутри миниатюр" },
    "Shorts and Playables": { es: "Shorts y Playables", de: "Shorts und Playables", fr: "Shorts et Playables", pt: "Shorts e Playables", ru: "Shorts и Playables" },
    "Hide Shorts everywhere": { es: "Ocultar Shorts en todas partes", de: "Shorts überall ausblenden", fr: "Masquer les Shorts partout", pt: "Ocultar Shorts em todo lugar", ru: "Скрыть Shorts везде" },
    "Open Shorts in the normal player": { es: "Abrir Shorts en el reproductor normal", de: "Shorts im normalen Player öffnen", fr: "Ouvrir les Shorts dans le lecteur normal", pt: "Abrir Shorts no player normal", ru: "Открывать Shorts в обычном плеере" },
    "Stops the endless swipe feed": { es: "Acaba con el feed infinito de deslizamiento", de: "Beendet den endlosen Wisch-Feed", fr: "Arrête le fil infini à balayer", pt: "Acaba com o feed infinito de deslizar", ru: "Без бесконечной ленты свайпов" },
    "Hide Playables": { es: "Ocultar Playables", de: "Playables ausblenden", fr: "Masquer Playables", pt: "Ocultar Playables", ru: "Скрыть Playables" },
    "Search": { es: "Búsqueda", de: "Suche", fr: "Recherche", pt: "Pesquisa", ru: "Поиск" },
    "Search box and results page.": { es: "Cuadro de búsqueda y página de resultados.", de: "Suchfeld und Ergebnisseite.", fr: "Champ de recherche et page de résultats.", pt: "Campo de pesquisa e página de resultados.", ru: "Строка поиска и страница результатов." },
    "Search box": { es: "Cuadro de búsqueda", de: "Suchfeld", fr: "Champ de recherche", pt: "Campo de pesquisa", ru: "Строка поиска" },
    "Turn off search suggestions": { es: "Desactivar sugerencias de búsqueda", de: "Suchvorschläge aus", fr: "Désactiver les suggestions", pt: "Desativar sugestões de pesquisa", ru: "Выключить подсказки поиска" },
    "Results": { es: "Resultados", de: "Ergebnisse", fr: "Résultats", pt: "Resultados", ru: "Результаты" },
    "Hide promoted results": { es: "Ocultar resultados promocionados", de: "Beworbene Ergebnisse ausblenden", fr: "Masquer les résultats sponsorisés", pt: "Ocultar resultados promovidos", ru: "Скрыть продвигаемые результаты" },
    "Hide “People also watched” rows": { es: "Ocultar filas «Otros también vieron»", de: "„Andere haben auch gesehen“-Reihen ausblenden", fr: "Masquer les rangées « D’autres ont regardé »", pt: "Ocultar fileiras «Outras pessoas assistiram»", ru: "Скрыть ряды «Другие смотрели»" },
    "Hide related search chips": { es: "Ocultar chips de búsqueda relacionada", de: "Verwandte Such-Chips ausblenden", fr: "Masquer les puces de recherche liée", pt: "Ocultar chips de pesquisa relacionada", ru: "Скрыть чипы похожих запросов" },
    "Sidebar": { es: "Barra lateral", de: "Seitenleiste", fr: "Barre latérale", pt: "Barra lateral", ru: "Боковая панель" },
    "Pick entries to remove from the left menu.": { es: "Elige qué quitar del menú izquierdo.", de: "Wähle Einträge, die aus dem linken Menü verschwinden.", fr: "Choisissez les entrées à retirer du menu gauche.", pt: "Escolha o que remover do menu esquerdo.", ru: "Выберите пункты, которые убрать из левого меню." },
    "Whole sidebar": { es: "Toda la barra", de: "Ganze Seitenleiste", fr: "Toute la barre", pt: "Barra inteira", ru: "Вся панель" },
    "Hide sidebar and menu button": { es: "Ocultar barra y botón de menú", de: "Seitenleiste und Menüknopf ausblenden", fr: "Masquer la barre et le bouton menu", pt: "Ocultar barra e botão de menu", ru: "Скрыть панель и кнопку меню" },
    "Hide the narrow icon bar": { es: "Ocultar la barra estrecha de iconos", de: "Schmale Symbolleiste ausblenden", fr: "Masquer la barre d’icônes étroite", pt: "Ocultar a barra estreita de ícones", ru: "Скрыть узкую панель значков" },
    "Main": { es: "Principal", de: "Hauptbereich", fr: "Principal", pt: "Principal", ru: "Основное" },
    "Hide this section": { es: "Ocultar esta sección", de: "Diesen Bereich ausblenden", fr: "Masquer cette section", pt: "Ocultar esta seção", ru: "Скрыть этот раздел" },
    "Shorts": { es: "Shorts", de: "Shorts", fr: "Shorts", pt: "Shorts", ru: "Shorts" },
    "Expand the whole list": { es: "Expandir toda la lista", de: "Ganze Liste ausklappen", fr: "Déplier toute la liste", pt: "Expandir a lista inteira", ru: "Развернуть весь список" },
    "You": { es: "Tú", de: "Du", fr: "Vous", pt: "Você", ru: "Вы" },
    "Your channel": { es: "Tu canal", de: "Dein Kanal", fr: "Votre chaîne", pt: "Seu canal", ru: "Ваш канал" },
    "Playlists": { es: "Playlists", de: "Playlists", fr: "Playlists", pt: "Playlists", ru: "Плейлисты" },
    "Liked videos": { es: "Vídeos que me gustan", de: "Videos mit „Gefällt mir“", fr: "Vidéos aimées", pt: "Vídeos curtidos", ru: "Понравившиеся" },
    "Your videos": { es: "Tus vídeos", de: "Deine Videos", fr: "Vos vidéos", pt: "Seus vídeos", ru: "Ваши видео" },
    "Downloads": { es: "Descargas", de: "Downloads", fr: "Téléchargements", pt: "Downloads", ru: "Скачанные" },
    "Courses": { es: "Cursos", de: "Kurse", fr: "Cours", pt: "Cursos", ru: "Курсы" },
    "Clips": { es: "Clips", de: "Clips", fr: "Extraits", pt: "Clipes", ru: "Клипы" },
    "“Show more” button": { es: "Botón «Mostrar más»", de: "Schaltfläche „Mehr anzeigen“", fr: "Bouton « Afficher plus »", pt: "Botão «Mostrar mais»", ru: "Кнопка «Ещё»" },
    "Explore": { es: "Explorar", de: "Entdecken", fr: "Explorer", pt: "Explorar", ru: "Навигатор" },
    "Music": { es: "Música", de: "Musik", fr: "Musique", pt: "Música", ru: "Музыка" },
    "Movies": { es: "Películas", de: "Filme", fr: "Films", pt: "Filmes", ru: "Фильмы" },
    "Hype": { es: "Hype", de: "Hype", fr: "Hype", pt: "Hype", ru: "Хайп" },
    "Live": { es: "En directo", de: "Live", fr: "En direct", pt: "Ao vivo", ru: "Эфир" },
    "Gaming": { es: "Videojuegos", de: "Gaming", fr: "Jeux", pt: "Jogos", ru: "Игры" },
    "News": { es: "Noticias", de: "Nachrichten", fr: "Actualités", pt: "Notícias", ru: "Новости" },
    "Sports": { es: "Deportes", de: "Sport", fr: "Sport", pt: "Esportes", ru: "Спорт" },
    "Podcasts": { es: "Pódcasts", de: "Podcasts", fr: "Podcasts", pt: "Podcasts", ru: "Подкасты" },
    "Playables": { es: "Playables", de: "Playables", fr: "Playables", pt: "Playables", ru: "Playables" },
    "Channel support": { es: "Apoyar el canal", de: "Kanal unterstützen", fr: "Soutenir la chaîne", pt: "Apoiar o canal", ru: "Поддержка канала" },
    "More from YouTube": { es: "Más de YouTube", de: "Mehr von YouTube", fr: "Plus de YouTube", pt: "Mais do YouTube", ru: "Ещё от YouTube" },
    "YouTube Music": { es: "YouTube Music", de: "YouTube Music", fr: "YouTube Music", pt: "YouTube Music", ru: "YouTube Music" },
    "YouTube Kids": { es: "YouTube Kids", de: "YouTube Kids", fr: "YouTube Kids", pt: "YouTube Kids", ru: "YouTube Kids" },
    "Report history": { es: "Historial de denuncias", de: "Meldeverlauf", fr: "Historique des signalements", pt: "Histórico de denúncias", ru: "История жалоб" },
    "Footer links": { es: "Enlaces del pie", de: "Fußzeilenlinks", fr: "Liens du pied de page", pt: "Links do rodapé", ru: "Ссылки внизу" },
    "Top bar": { es: "Barra superior", de: "Obere Leiste", fr: "Barre du haut", pt: "Barra superior", ru: "Верхняя панель" },
    "Logo, search and account buttons.": { es: "Logo, búsqueda y botones de la cuenta.", de: "Logo, Suche und Kontoschaltflächen.", fr: "Logo, recherche et boutons du compte.", pt: "Logo, pesquisa e botões da conta.", ru: "Логотип, поиск и кнопки аккаунта." },
    "Hide the entire bar": { es: "Ocultar toda la barra", de: "Ganze Leiste ausblenden", fr: "Masquer toute la barre", pt: "Ocultar a barra inteira", ru: "Скрыть всю панель" },
    "Menu button": { es: "Botón de menú", de: "Menüknopf", fr: "Bouton menu", pt: "Botão de menu", ru: "Кнопка меню" },
    "Logo": { es: "Logo", de: "Logo", fr: "Logo", pt: "Logo", ru: "Логотип" },
    "Search bar": { es: "Barra de búsqueda", de: "Suchleiste", fr: "Barre de recherche", pt: "Barra de pesquisa", ru: "Строка поиска" },
    "Microphone": { es: "Micrófono", de: "Mikrofon", fr: "Micro", pt: "Microfone", ru: "Микрофон" },
    "Create / upload": { es: "Crear / subir", de: "Erstellen / hochladen", fr: "Créer / importer", pt: "Criar / enviar", ru: "Создать / загрузить" },
    "Notifications": { es: "Notificaciones", de: "Benachrichtigungen", fr: "Notifications", pt: "Notificações", ru: "Уведомления" },
    "Account avatar": { es: "Avatar de la cuenta", de: "Kontobild", fr: "Avatar du compte", pt: "Avatar da conta", ru: "Аватар аккаунта" },
    "Distractions": { es: "Distracciones", de: "Ablenkungen", fr: "Distractions", pt: "Distrações", ru: "Отвлекающее" },
    "Hide the unread-notification counter": { es: "Ocultar el contador de no leídas", de: "Zähler ungelesener Hinweise ausblenden", fr: "Masquer le compteur de non-lus", pt: "Ocultar o contador de não lidas", ru: "Скрыть счётчик непрочитанных" },
    "Hide Premium offers and banners": { es: "Ocultar ofertas y banners de Premium", de: "Premium-Angebote und Banner ausblenden", fr: "Masquer offres et bannières Premium", pt: "Ocultar ofertas e banners Premium", ru: "Скрыть баннеры и предложения Premium" },
    "Player": { es: "Reproductor", de: "Player", fr: "Lecteur", pt: "Player", ru: "Плеер" },
    "Overlays, buttons and playback behaviour.": { es: "Capas, botones y comportamiento de reproducción.", de: "Overlays, Schaltflächen und Wiedergabe.", fr: "Calques, boutons et lecture.", pt: "Sobreposições, botões e reprodução.", ru: "Оверлеи, кнопки и поведение воспроизведения." },
    "Behaviour": { es: "Comportamiento", de: "Verhalten", fr: "Comportement", pt: "Comportamento", ru: "Поведение" },
    "Turn autoplay off": { es: "Desactivar reproducción automática", de: "Autoplay ausschalten", fr: "Désactiver la lecture auto", pt: "Desativar reprodução automática", ru: "Выключить автовоспроизведение" },
    "Next video never starts by itself": { es: "El siguiente vídeo no empieza solo", de: "Das nächste Video startet nie von allein", fr: "La vidéo suivante ne démarre jamais seule", pt: "O próximo vídeo nunca começa sozinho", ru: "Следующее видео не начинается само" },
    "Start in theater mode": { es: "Empezar en modo cine", de: "Im Kinomodus starten", fr: "Démarrer en mode cinéma", pt: "Começar no modo cinema", ru: "Начинать в режиме кинотеатра" },
    "Overlays": { es: "Capas", de: "Overlays", fr: "Calques", pt: "Sobreposições", ru: "Оверлеи" },
    "End screen suggestions": { es: "Sugerencias al final", de: "Vorschläge am Ende", fr: "Suggestions de fin", pt: "Sugestões no final", ru: "Предложения в конце" },
    "“More videos” when paused": { es: "«Más vídeos» en pausa", de: "„Mehr Videos“ bei Pause", fr: "« Plus de vidéos » en pause", pt: "«Mais vídeos» na pausa", ru: "«Ещё видео» на паузе" },
    "Also the grid shown in fullscreen": { es: "También la cuadrícula a pantalla completa", de: "Auch das Raster im Vollbild", fr: "Aussi la grille en plein écran", pt: "Também a grade em tela cheia", ru: "И сетка в полноэкранном режиме" },
    "End cards": { es: "Tarjetas finales", de: "Endkarten", fr: "Fiches de fin", pt: "Cartões finais", ru: "Конечные карточки" },
    "Info cards": { es: "Tarjetas de información", de: "Infokarten", fr: "Fiches d’info", pt: "Cartões de informação", ru: "Инфокарточки" },
    "Channel watermark": { es: "Marca de agua del canal", de: "Kanalwasserzeichen", fr: "Filigrane de la chaîne", pt: "Marca d’água do canal", ru: "Водяной знак канала" },
    "“Includes paid promotion”": { es: "«Incluye promoción de pago»", de: "„Enthält bezahlte Werbung“", fr: "« Comprend une promotion payante »", pt: "«Inclui promoção paga»", ru: "«Есть платная реклама»" },
    "On-video captions": { es: "Subtítulos sobre el vídeo", de: "Untertitel im Video", fr: "Sous-titres sur la vidéo", pt: "Legendas sobre o vídeo", ru: "Субтитры на видео" },
    "Annotations": { es: "Anotaciones", de: "Anmerkungen", fr: "Annotations", pt: "Anotações", ru: "Аннотации" },
    "Title inside the player": { es: "Título dentro del reproductor", de: "Titel im Player", fr: "Titre dans le lecteur", pt: "Título dentro do player", ru: "Название в плеере" },
    "Ambient glow behind the video": { es: "Brillo ambiental detrás del vídeo", de: "Ambientlicht hinter dem Video", fr: "Lueur ambiante derrière la vidéo", pt: "Brilho ambiente atrás do vídeo", ru: "Подсветка за видео" },
    "Progress bar": { es: "Barra de progreso", de: "Fortschrittsbalken", fr: "Barre de progression", pt: "Barra de progresso", ru: "Полоса прогресса" },
    "Most replayed graph": { es: "Gráfico de lo más visto", de: "Diagramm „Am häufigsten erneut angesehen“", fr: "Graphique des plus revisionnés", pt: "Gráfico do mais assistido", ru: "График самых пересматриваемых" },
    "Video time": { es: "Tiempo del vídeo", de: "Videozeit", fr: "Durée de la vidéo", pt: "Tempo do vídeo", ru: "Время видео" },
    "Chapters": { es: "Capítulos", de: "Kapitel", fr: "Chapitres", pt: "Capítulos", ru: "Главы" },
    "Control buttons": { es: "Botones de control", de: "Steuerung", fr: "Boutons de lecture", pt: "Botões de controle", ru: "Кнопки управления" },
    "Play / pause": { es: "Reproducir / pausa", de: "Wiedergabe / Pause", fr: "Lecture / pause", pt: "Reproduzir / pausar", ru: "Воспроизведение / пауза" },
    "Replay": { es: "Repetir", de: "Erneut abspielen", fr: "Revoir", pt: "Repetir", ru: "Повтор" },
    "Next video": { es: "Vídeo siguiente", de: "Nächstes Video", fr: "Vidéo suivante", pt: "Próximo vídeo", ru: "Следующее видео" },
    "Previous video": { es: "Vídeo anterior", de: "Vorheriges Video", fr: "Vidéo précédente", pt: "Vídeo anterior", ru: "Предыдущее видео" },
    "Volume": { es: "Volumen", de: "Lautstärke", fr: "Volume", pt: "Volume", ru: "Громкость" },
    "Autoplay switch": { es: "Interruptor de reproducción automática", de: "Autoplay-Schalter", fr: "Interrupteur de lecture auto", pt: "Interruptor de reprodução automática", ru: "Переключатель автовоспроизведения" },
    "Subtitles": { es: "Subtítulos", de: "Untertitel", fr: "Sous-titres", pt: "Legendas", ru: "Субтитры" },
    "Settings": { es: "Ajustes", de: "Einstellungen", fr: "Paramètres", pt: "Configurações", ru: "Настройки" },
    "Miniplayer": { es: "Minirreproductor", de: "Miniplayer", fr: "Mini-lecteur", pt: "Minirreprodutor", ru: "Мини-плеер" },
    "Theater mode": { es: "Modo cine", de: "Kinomodus", fr: "Mode cinéma", pt: "Modo cinema", ru: "Режим кинотеатра" },
    "Full screen": { es: "Pantalla completa", de: "Vollbild", fr: "Plein écran", pt: "Tela cheia", ru: "Полный экран" },
    "AirPlay": { es: "AirPlay", de: "AirPlay", fr: "AirPlay", pt: "AirPlay", ru: "AirPlay" },
    "“More from this channel”": { es: "«Más de este canal»", de: "„Mehr von diesem Kanal“", fr: "« Plus de cette chaîne »", pt: "«Mais deste canal»", ru: "«Ещё с этого канала»" },
    "Video page": { es: "Página del vídeo", de: "Videoseite", fr: "Page de la vidéo", pt: "Página do vídeo", ru: "Страница видео" },
    "Everything around the player.": { es: "Todo alrededor del reproductor.", de: "Alles rund um den Player.", fr: "Tout autour du lecteur.", pt: "Tudo ao redor do player.", ru: "Всё вокруг плеера." },
    "Right column": { es: "Columna derecha", de: "Rechte Spalte", fr: "Colonne de droite", pt: "Coluna direita", ru: "Правая колонка" },
    "Hide the entire column": { es: "Ocultar toda la columna", de: "Ganze Spalte ausblenden", fr: "Masquer toute la colonne", pt: "Ocultar a coluna inteira", ru: "Скрыть всю колонку" },
    "Related videos": { es: "Vídeos relacionados", de: "Ähnliche Videos", fr: "Vidéos similaires", pt: "Vídeos relacionados", ru: "Похожие видео" },
    "Live chat": { es: "Chat en directo", de: "Livechat", fr: "Chat en direct", pt: "Chat ao vivo", ru: "Чат трансляции" },
    "Playlist panel": { es: "Panel de la playlist", de: "Playlist-Bereich", fr: "Panneau de playlist", pt: "Painel da playlist", ru: "Панель плейлиста" },
    "Fundraiser": { es: "Recaudación", de: "Spendenaktion", fr: "Collecte", pt: "Campanha", ru: "Сбор средств" },
    "“Up next” card": { es: "Tarjeta «A continuación»", de: "Karte „Als Nächstes“", fr: "Carte « À suivre »", pt: "Cartão «A seguir»", ru: "Карточка «Далее»" },
    "Ads in related": { es: "Anuncios en relacionados", de: "Werbung bei Ähnlichen", fr: "Pubs dans les similaires", pt: "Anúncios nos relacionados", ru: "Реклама в похожих" },
    "Shorts in related": { es: "Shorts en relacionados", de: "Shorts bei Ähnlichen", fr: "Shorts dans les similaires", pt: "Shorts nos relacionados", ru: "Shorts в похожих" },
    "Filter chips": { es: "Filtros", de: "Filter-Chips", fr: "Puces de filtre", pt: "Filtros", ru: "Фильтры" },
    "Title and channel": { es: "Título y canal", de: "Titel und Kanal", fr: "Titre et chaîne", pt: "Título e canal", ru: "Название и канал" },
    "Video title": { es: "Título del vídeo", de: "Videotitel", fr: "Titre de la vidéo", pt: "Título do vídeo", ru: "Название видео" },
    "Channel avatar": { es: "Avatar del canal", de: "Kanalbild", fr: "Avatar de la chaîne", pt: "Avatar do canal", ru: "Аватар канала" },
    "Channel name": { es: "Nombre del canal", de: "Kanalname", fr: "Nom de la chaîne", pt: "Nome do canal", ru: "Название канала" },
    "Subscriber count": { es: "Número de suscriptores", de: "Abonnentenzahl", fr: "Nombre d’abonnés", pt: "Número de inscritos", ru: "Число подписчиков" },
    "Verified badge": { es: "Insignia de verificación", de: "Verifiziert-Abzeichen", fr: "Badge de vérification", pt: "Selo de verificação", ru: "Галочка верификации" },
    "Fundraiser badge": { es: "Insignia de recaudación", de: "Spenden-Abzeichen", fr: "Badge de collecte", pt: "Selo de campanha", ru: "Значок сбора средств" },
    "Action buttons": { es: "Botones de acción", de: "Aktionsschaltflächen", fr: "Boutons d’action", pt: "Botões de ação", ru: "Кнопки действий" },
    "Subscribe": { es: "Suscribirse", de: "Abonnieren", fr: "S’abonner", pt: "Inscrever-se", ru: "Подписаться" },
    "Notification bell": { es: "Campana de notificaciones", de: "Benachrichtigungsglocke", fr: "Cloche de notification", pt: "Sino de notificações", ru: "Колокольчик" },
    "Join": { es: "Unirse", de: "Beitreten", fr: "Rejoindre", pt: "Participar", ru: "Вступить" },
    "Likes": { es: "Me gusta", de: "„Gefällt mir“", fr: "J’aime", pt: "Curtidas", ru: "Лайки" },
    "Share": { es: "Compartir", de: "Teilen", fr: "Partager", pt: "Compartilhar", ru: "Поделиться" },
    "Download": { es: "Descargar", de: "Download", fr: "Télécharger", pt: "Download", ru: "Скачать" },
    "Save": { es: "Guardar", de: "Speichern", fr: "Enregistrer", pt: "Salvar", ru: "Сохранить" },
    "Clip": { es: "Clip", de: "Clip", fr: "Extrait", pt: "Clipe", ru: "Клип" },
    "Super Thanks": { es: "Super Thanks", de: "Super Thanks", fr: "Super Thanks", pt: "Super Thanks", ru: "Super Thanks" },
    "Ask (AI) button": { es: "Botón Preguntar (IA)", de: "Schaltfläche Fragen (KI)", fr: "Bouton Demander (IA)", pt: "Botão Perguntar (IA)", ru: "Кнопка «Спросить» (ИИ)" },
    "Merch, tickets and offers": { es: "Merch, entradas y ofertas", de: "Merch, Tickets und Angebote", fr: "Produits, billets et offres", pt: "Merch, ingressos e ofertas", ru: "Мерч, билеты и предложения" },
    "“More” menu": { es: "Menú «Más»", de: "Menü „Mehr“", fr: "Menu « Plus »", pt: "Menu «Mais»", ru: "Меню «Ещё»" },
    "Description": { es: "Descripción", de: "Beschreibung", fr: "Description", pt: "Descrição", ru: "Описание" },
    "Hide description": { es: "Ocultar la descripción", de: "Beschreibung ausblenden", fr: "Masquer la description", pt: "Ocultar a descrição", ru: "Скрыть описание" },
    "Expand automatically": { es: "Expandir automáticamente", de: "Automatisch ausklappen", fr: "Déplier automatiquement", pt: "Expandir automaticamente", ru: "Разворачивать автоматически" },
    "View count": { es: "Número de visualizaciones", de: "Aufrufe", fr: "Nombre de vues", pt: "Número de visualizações", ru: "Число просмотров" },
    "Publish date": { es: "Fecha de publicación", de: "Veröffentlichungsdatum", fr: "Date de publication", pt: "Data de publicação", ru: "Дата публикации" },
    "Hashtags": { es: "Hashtags", de: "Hashtags", fr: "Hashtags", pt: "Hashtags", ru: "Хештеги" },
    "Channel box": { es: "Recuadro del canal", de: "Kanalkasten", fr: "Encadré de la chaîne", pt: "Caixa do canal", ru: "Блок канала" },
    "Chapters list": { es: "Lista de capítulos", de: "Kapitelliste", fr: "Liste des chapitres", pt: "Lista de capítulos", ru: "Список глав" },
    "License and metadata rows": { es: "Licencia y metadatos", de: "Lizenz und Metadaten", fr: "Licence et métadonnées", pt: "Licença e metadados", ru: "Лицензия и метаданные" },
    "Transcript": { es: "Transcripción", de: "Transkript", fr: "Transcription", pt: "Transcrição", ru: "Расшифровка" },
    "Comments": { es: "Comentarios", de: "Kommentare", fr: "Commentaires", pt: "Comentários", ru: "Комментарии" },
    "Hide all of it or just the noisy parts.": { es: "Oculta todo o solo lo ruidoso.", de: "Alles ausblenden oder nur das Laute.", fr: "Masquez tout ou seulement le bruit.", pt: "Oculte tudo ou só o que atrapalha.", ru: "Скрыть всё или только шумное." },
    "Hide the entire section": { es: "Ocultar toda la sección", de: "Ganzen Bereich ausblenden", fr: "Masquer toute la section", pt: "Ocultar a seção inteira", ru: "Скрыть весь раздел" },
    "Comment box": { es: "Cuadro de comentario", de: "Kommentarfeld", fr: "Champ de commentaire", pt: "Campo de comentário", ru: "Поле комментария" },
    "Header and count": { es: "Encabezado y número", de: "Kopfzeile und Anzahl", fr: "En-tête et nombre", pt: "Cabeçalho e número", ru: "Заголовок и число" },
    "Sort menu": { es: "Menú de orden", de: "Sortiermenü", fr: "Menu de tri", pt: "Menu de ordenação", ru: "Меню сортировки" },
    "Avatars": { es: "Avatares", de: "Avatare", fr: "Avatars", pt: "Avatares", ru: "Аватары" },
    "Replies": { es: "Respuestas", de: "Antworten", fr: "Réponses", pt: "Respostas", ru: "Ответы" },
    "Creator hearts": { es: "Corazones del creador", de: "Ersteller-Herzen", fr: "Cœurs du créateur", pt: "Corações do criador", ru: "Сердечки автора" },
    "Badges": { es: "Insignias", de: "Abzeichen", fr: "Badges", pt: "Selos", ru: "Значки" },
    "“Pinned” label": { es: "Etiqueta «Fijado»", de: "Hinweis „Angeheftet“", fr: "Libellé « Épinglé »", pt: "Rótulo «Fixado»", ru: "Метка «Закреплено»" },
    "Comment time": { es: "Hora del comentario", de: "Kommentarzeit", fr: "Heure du commentaire", pt: "Hora do comentário", ru: "Время комментария" },
    "Look": { es: "Aspecto", de: "Aussehen", fr: "Apparence", pt: "Aparência", ru: "Вид" },
    "Make YouTube less eye-catching.": { es: "Haz que YouTube llame menos la atención.", de: "YouTube weniger aufdringlich machen.", fr: "Rendre YouTube moins accrocheur.", pt: "Deixe o YouTube menos chamativo.", ru: "Сделать YouTube менее кричащим." },
    "Grayscale": { es: "Escala de grises", de: "Graustufen", fr: "Niveaux de gris", pt: "Escala de cinza", ru: "Оттенки серого" },
    "Thumbnails": { es: "Miniaturas", de: "Miniaturansichten", fr: "Miniatures", pt: "Miniaturas", ru: "Миниатюры" },
    "Channel avatars": { es: "Avatares de canales", de: "Kanalbilder", fr: "Avatars des chaînes", pt: "Avatares de canais", ru: "Аватары каналов" },
    "Video player": { es: "Reproductor de vídeo", de: "Videoplayer", fr: "Lecteur vidéo", pt: "Player de vídeo", ru: "Видеоплеер" },
    "The whole page": { es: "Toda la página", de: "Die ganze Seite", fr: "Toute la page", pt: "A página inteira", ru: "Вся страница" },
    "Everything, including the video": { es: "Todo, incluido el vídeo", de: "Alles, auch das Video", fr: "Tout, y compris la vidéo", pt: "Tudo, inclusive o vídeo", ru: "Всё, включая видео" },
    "Blur thumbnails until hover": { es: "Desenfocar miniaturas hasta pasar el cursor", de: "Miniaturen bis zum Darüberfahren verwischen", fr: "Flouter les miniatures jusqu’au survol", pt: "Desfocar miniaturas até passar o mouse", ru: "Размывать миниатюры до наведения" },
    "Judge a video by its title, not its cover": { es: "Juzga un vídeo por el título, no por la portada", de: "Ein Video nach dem Titel beurteilen, nicht nach dem Cover", fr: "Juger une vidéo par son titre, pas sa vignette", pt: "Julgue um vídeo pelo título, não pela capa", ru: "Оценивать видео по названию, не по обложке" },
    "Make thumbnails invisible": { es: "Hacer invisibles las miniaturas", de: "Miniaturen unsichtbar machen", fr: "Rendre les miniatures invisibles", pt: "Deixar as miniaturas invisíveis", ru: "Сделать миниатюры невидимыми" },
    "Hide channel avatars in feeds": { es: "Ocultar avatares de canales en los feeds", de: "Kanalbilder in Feeds ausblenden", fr: "Masquer les avatars dans les fils", pt: "Ocultar avatares de canais nos feeds", ru: "Скрыть аватары каналов в лентах" },
    "Make YouTube yours": { es: "Haz YouTube a tu manera", de: "Mach YouTube zu deinem", fr: "Faites de YouTube le vôtre", pt: "Deixe o YouTube do seu jeito", ru: "Настройте YouTube под себя" },
    "Search settings…": { es: "Buscar ajustes…", de: "Einstellungen suchen…", fr: "Rechercher un réglage…", pt: "Buscar configurações…", ru: "Поиск настроек…" },
    "Nothing matches “{q}”.": { es: "Nada coincide con «{q}».", de: "Nichts passt zu „{q}“.", fr: "Aucun résultat pour « {q} ».", pt: "Nada corresponde a “{q}”.", ru: "Нет совпадений для «{q}»." },
    "On": { es: "Activada", de: "An", fr: "Activée", pt: "Ativada", ru: "Включена" },
    "Paused": { es: "En pausa", de: "Pausiert", fr: "En pause", pt: "Pausada", ru: "На паузе" },
    "The extension is paused. YouTube looks the way it ships.": { es: "La extensión está en pausa. YouTube se ve como de fábrica.", de: "Die Erweiterung ist pausiert. YouTube sieht aus wie ab Werk.", fr: "L’extension est en pause. YouTube est comme d’origine.", pt: "A extensão está pausada. O YouTube está como de fábrica.", ru: "Расширение на паузе. YouTube выглядит как по умолчанию." },
    "{n} active": { es: "{n} activas", de: "{n} aktiv", fr: "{n} actives", pt: "{n} ativas", ru: "{n} активно" },
    "Tools": { es: "Herramientas", de: "Werkzeuge", fr: "Outils", pt: "Ferramentas", ru: "Инструменты" },
    "Hidden elements and backup.": { es: "Elementos ocultos y copia de seguridad.", de: "Ausgeblendete Elemente und Sicherung.", fr: "Éléments masqués et sauvegarde.", pt: "Elementos ocultos e backup.", ru: "Скрытые элементы и резервная копия." },
    "Applied": { es: "Aplicado", de: "Übernommen", fr: "Appliqué", pt: "Aplicado", ru: "Применено" },
    "Hidden elements": { es: "Elementos ocultos", de: "Ausgeblendete Elemente", fr: "Éléments masqués", pt: "Elementos ocultos", ru: "Скрытые элементы" },
    "Remove anything on YouTube with a click.": { es: "Quita cualquier cosa de YouTube con un clic.", de: "Entferne alles auf YouTube mit einem Klick.", fr: "Retirez n’importe quoi sur YouTube d’un clic.", pt: "Remova qualquer coisa do YouTube com um clique.", ru: "Уберите что угодно на YouTube одним щелчком." },
    "Pick an element on the page": { es: "Elegir un elemento en la página", de: "Element auf der Seite auswählen", fr: "Choisir un élément sur la page", pt: "Escolher um elemento na página", ru: "Указать элемент на странице" },
    "Switch to a YouTube tab first (reload it if it was already open).": { es: "Pasa primero a una pestaña de YouTube (recárgala si ya estaba abierta).", de: "Wechsle zuerst zu einem YouTube-Tab (neu laden, falls er schon offen war).", fr: "Ouvrez d’abord un onglet YouTube (rechargez-le s’il était déjà ouvert).", pt: "Vá primeiro a uma aba do YouTube (recarregue se ela já estava aberta).", ru: "Сначала откройте вкладку YouTube (обновите её, если она уже была открыта)." },
    "or type a CSS selector": { es: "o escribe un selector CSS", de: "oder einen CSS-Selektor eingeben", fr: "ou saisissez un sélecteur CSS", pt: "ou digite um seletor CSS", ru: "или введите CSS-селектор" },
    "Add": { es: "Añadir", de: "Hinzufügen", fr: "Ajouter", pt: "Adicionar", ru: "Добавить" },
    "Remove": { es: "Quitar", de: "Entfernen", fr: "Retirer", pt: "Remover", ru: "Убрать" },
    "That is not a valid selector.": { es: "Ese selector no es válido.", de: "Das ist kein gültiger Selektor.", fr: "Ce sélecteur n’est pas valide.", pt: "Esse seletor não é válido.", ru: "Это неверный селектор." },
    "Nothing hidden yet.": { es: "Todavía no hay nada oculto.", de: "Noch ist nichts ausgeblendet.", fr: "Rien de masqué pour l’instant.", pt: "Nada oculto ainda.", ru: "Пока ничего не скрыто." },
    "Backup": { es: "Copia", de: "Sicherung", fr: "Sauvegarde", pt: "Backup", ru: "Копия" },
    "Copy this text to move your setup to another browser.": { es: "Copia este texto para llevar tu configuración a otro navegador.", de: "Kopiere diesen Text, um dein Setup in einen anderen Browser zu übernehmen.", fr: "Copiez ce texte pour déplacer vos réglages vers un autre navigateur.", pt: "Copie este texto para levar sua configuração a outro navegador.", ru: "Скопируйте этот текст, чтобы перенести настройки в другой браузер." },
    "Export": { es: "Exportar", de: "Exportieren", fr: "Exporter", pt: "Exportar", ru: "Экспорт" },
    "Copy": { es: "Copiar", de: "Kopieren", fr: "Copier", pt: "Copiar", ru: "Копировать" },
    "Copied": { es: "Copiado", de: "Kopiert", fr: "Copié", pt: "Copiado", ru: "Скопировано" },
    "Import": { es: "Importar", de: "Importieren", fr: "Importer", pt: "Importar", ru: "Импорт" },
    "Paste a settings string here…": { es: "Pega aquí la cadena de ajustes…", de: "Einstellungszeichenfolge hier einfügen…", fr: "Collez ici la chaîne de réglages…", pt: "Cole a sequência de configurações aqui…", ru: "Вставьте сюда строку настроек…" },
    "Imported {n} settings. Previous ones were replaced.": { es: "Se importaron {n} ajustes. Los anteriores se sustituyeron.", de: "{n} Einstellungen importiert. Die vorherigen wurden ersetzt.", fr: "{n} réglages importés. Les précédents ont été remplacés.", pt: "{n} configurações importadas. As anteriores foram substituídas.", ru: "Импортировано настроек: {n}. Прежние заменены." },
    "This text is not a valid settings string.": { es: "Este texto no es una cadena de ajustes válida.", de: "Dieser Text ist keine gültige Einstellungszeichenfolge.", fr: "Ce texte n’est pas une chaîne de réglages valide.", pt: "Este texto não é uma sequência de configurações válida.", ru: "Этот текст — не строка настроек." },
    "Language": { es: "Idioma", de: "Sprache", fr: "Langue", pt: "Idioma", ru: "Язык" },
    "Automatic": { es: "Automático", de: "Automatisch", fr: "Automatique", pt: "Automático", ru: "Автоматически" },
    "Reset everything": { es: "Restablecer todo", de: "Alles zurücksetzen", fr: "Tout réinitialiser", pt: "Redefinir tudo", ru: "Сбросить всё" },
    "Reset all settings and hidden elements?": { es: "¿Restablecer todos los ajustes y los elementos ocultos?", de: "Alle Einstellungen und ausgeblendeten Elemente zurücksetzen?", fr: "Réinitialiser tous les réglages et les éléments masqués ?", pt: "Redefinir todas as configurações e os elementos ocultos?", ru: "Сбросить все настройки и скрытые элементы?" },
    "Click the element to hide. Esc cancels.": { es: "Haz clic en el elemento para ocultarlo. Esc cancela.", de: "Klicke das Element an, um es auszublenden. Esc bricht ab.", fr: "Cliquez sur l’élément à masquer. Échap annule.", pt: "Clique no elemento para ocultar. Esc cancela.", ru: "Щёлкните элемент, чтобы скрыть его. Esc отменяет." },
    "Hide it": { es: "Ocultarlo", de: "Ausblenden", fr: "Le masquer", pt: "Ocultar", ru: "Скрыть" },
    "Select parent": { es: "Seleccionar el superior", de: "Übergeordnetes wählen", fr: "Sélectionner le parent", pt: "Selecionar o pai", ru: "Выбрать родителя" },
    "Cancel": { es: "Cancelar", de: "Abbrechen", fr: "Annuler", pt: "Cancelar", ru: "Отмена" },
    "Hidden. Undo it in the extension popup → Tools.": { es: "Oculto. Deshazlo en la ventana de la extensión → Herramientas.", de: "Ausgeblendet. Rückgängig im Erweiterungsfenster → Werkzeuge.", fr: "Masqué. Annulez-le dans la fenêtre de l’extension → Outils.", pt: "Oculto. Desfaça no pop-up da extensão → Ferramentas.", ru: "Скрыто. Отмените в окне расширения → Инструменты." },
  };

  const MORE = {
    "Home": {
      "ja": "ホーム",
      "zh": "首页",
      "ko": "홈",
      "hi": "होम",
      "ar": "الرئيسية",
      "id": "Beranda"
    },
    "What you see when YouTube opens.": {
      "ja": "YouTubeを開いたときに見えるもの。",
      "zh": "打开 YouTube 时看到的内容。",
      "ko": "YouTube를 열면 보이는 것.",
      "hi": "YouTube खोलने पर जो दिखता है।",
      "ar": "ما تراه عند فتح YouTube.",
      "id": "Yang terlihat saat YouTube dibuka."
    },
    "Start": {
      "ja": "開始",
      "zh": "开始",
      "ko": "시작",
      "hi": "शुरू",
      "ar": "البدء",
      "id": "Mulai"
    },
    "Open instead of Home": {
      "ja": "ホームの代わりに開く",
      "zh": "打开此页而不是首页",
      "ko": "홈 대신 열기",
      "hi": "होम की जगह यह खोलें",
      "ar": "فتح هذا بدل الصفحة الرئيسية",
      "id": "Buka ini, bukan Beranda"
    },
    "Subscriptions": {
      "ja": "登録チャンネル",
      "zh": "订阅",
      "ko": "구독",
      "hi": "सदस्यता",
      "ar": "الاشتراكات",
      "id": "Langganan"
    },
    "History": {
      "ja": "履歴",
      "zh": "历史记录",
      "ko": "기록",
      "hi": "इतिहास",
      "ar": "السجل",
      "id": "Histori"
    },
    "Library": {
      "ja": "ライブラリ",
      "zh": "媒体库",
      "ko": "라이브러리",
      "hi": "लाइब्रेरी",
      "ar": "المكتبة",
      "id": "Koleksi"
    },
    "Watch later": {
      "ja": "後で見る",
      "zh": "稍后观看",
      "ko": "나중에 볼 동영상",
      "hi": "बाद में देखें",
      "ar": "المشاهدة لاحقًا",
      "id": "Tonton nanti"
    },
    "YouTube default": {
      "ja": "YouTubeの標準",
      "zh": "YouTube 默认",
      "ko": "YouTube 기본값",
      "hi": "YouTube डिफ़ॉल्ट",
      "ar": "افتراضي YouTube",
      "id": "Bawaan YouTube"
    },
    "Only when YouTube opens. The logo still opens Home.": {
      "ja": "YouTubeを開いたときだけ。ロゴは引き続きホームを開きます。",
      "zh": "仅在打开 YouTube 时。点标志仍会打开首页。",
      "ko": "YouTube를 열 때만. 로고는 계속 홈을 엽니다.",
      "hi": "सिर्फ YouTube खुलने पर। लोगो फिर भी होम खोलता है।",
      "ar": "فقط عند فتح YouTube. الشعار ما زال يفتح الرئيسية.",
      "id": "Hanya saat YouTube dibuka. Logo tetap membuka Beranda."
    },
    "Videos per row": {
      "ja": "1行の動画数",
      "zh": "每行视频数",
      "ko": "한 줄의 동영상 수",
      "hi": "प्रति पंक्ति वीडियो",
      "ar": "فيديوهات في الصف",
      "id": "Video per baris"
    },
    "Recommendations": {
      "ja": "おすすめ",
      "zh": "推荐",
      "ko": "추천",
      "hi": "सुझाव",
      "ar": "الاقتراحات",
      "id": "Rekomendasi"
    },
    "Hide the recommended feed": {
      "ja": "おすすめフィードを隠す",
      "zh": "隐藏推荐信息流",
      "ko": "추천 피드 숨기기",
      "hi": "सुझाया फ़ीड छिपाएँ",
      "ar": "إخفاء خلاصة الاقتراحات",
      "id": "Sembunyikan feed rekomendasi"
    },
    "Leaves the Home page empty": {
      "ja": "ホームページが空になります",
      "zh": "首页会变空",
      "ko": "홈이 비게 됩니다",
      "hi": "होम पेज खाली रह जाता है",
      "ar": "تصبح الصفحة الرئيسية فارغة",
      "id": "Beranda jadi kosong"
    },
    "Hide playlists and mixes": {
      "ja": "再生リストとミックスを隠す",
      "zh": "隐藏播放列表和合辑",
      "ko": "재생목록과 믹스 숨기기",
      "hi": "प्लेलिस्ट और मिक्स छिपाएँ",
      "ar": "إخفاء قوائم التشغيل والمزيج",
      "id": "Sembunyikan playlist dan mix"
    },
    "Hide ads in the feed": {
      "ja": "フィードの広告を隠す",
      "zh": "隐藏信息流中的广告",
      "ko": "피드 광고 숨기기",
      "hi": "फ़ीड के विज्ञापन छिपाएँ",
      "ar": "إخفاء إعلانات الخلاصة",
      "id": "Sembunyikan iklan di feed"
    },
    "Promoted tiles and banners only": {
      "ja": "宣伝タイルとバナーだけ",
      "zh": "仅推广图块和横幅",
      "ko": "홍보 타일과 배너만",
      "hi": "सिर्फ प्रचार टाइल और बैनर",
      "ar": "المربعات واللافتات المروَّجة فقط",
      "id": "Hanya ubin dan spanduk promosi"
    },
    "Hide the topic chips bar": {
      "ja": "トピックチップのバーを隠す",
      "zh": "隐藏主题标签栏",
      "ko": "주제 칩 막대 숨기기",
      "hi": "विषय चिप बार छिपाएँ",
      "ar": "إخفاء شريط التصنيفات",
      "id": "Sembunyikan bilah kategori"
    },
    "Hide extra shelves": {
      "ja": "追加の棚を隠す",
      "zh": "隐藏额外货架",
      "ko": "추가 선반 숨기기",
      "hi": "अतिरिक्त शेल्फ़ छिपाएँ",
      "ar": "إخفاء الرفوف الإضافية",
      "id": "Sembunyikan rak tambahan"
    },
    "News, posts, Shorts rows between videos": {
      "ja": "動画の間のニュース、投稿、Shortsの行",
      "zh": "视频之间的新闻、帖子和 Shorts 行",
      "ko": "동영상 사이의 뉴스, 게시물, Shorts 행",
      "hi": "वीडियो के बीच समाचार, पोस्ट और Shorts की पंक्तियाँ",
      "ar": "الأخبار والمنشورات وصفوف Shorts بين الفيديوهات",
      "id": "Berita, postingan, dan baris Shorts di antara video"
    },
    "Hide community posts": {
      "ja": "コミュニティ投稿を隠す",
      "zh": "隐藏社区帖子",
      "ko": "커뮤니티 게시물 숨기기",
      "hi": "कम्युनिटी पोस्ट छिपाएँ",
      "ar": "إخفاء منشورات المجتمع",
      "id": "Sembunyikan postingan komunitas"
    },
    "Turn off hover previews": {
      "ja": "ホバープレビューをオフ",
      "zh": "关闭悬停预览",
      "ko": "가리키면 미리보기 끄기",
      "hi": "होवर पूर्वावलोकन बंद करें",
      "ar": "إيقاف معاينة المرور",
      "id": "Matikan pratinjau saat kursor di atas"
    },
    "No video playing inside thumbnails": {
      "ja": "サムネイル内で動画を再生しない",
      "zh": "缩略图里不播放视频",
      "ko": "썸네일 안에서 재생 안 함",
      "hi": "थंबनेल में वीडियो न चले",
      "ar": "بدون تشغيل داخل الصور المصغرة",
      "id": "Tanpa video yang diputar di thumbnail"
    },
    "Shorts and Playables": {
      "ja": "ShortsとPlayables",
      "zh": "Shorts 和 Playables",
      "ko": "Shorts 및 Playables",
      "hi": "Shorts और Playables",
      "ar": "Shorts وPlayables",
      "id": "Shorts dan Playables"
    },
    "Hide Shorts everywhere": {
      "ja": "Shortsをどこでも隠す",
      "zh": "在所有位置隐藏 Shorts",
      "ko": "Shorts를 어디서나 숨기기",
      "hi": "हर जगह Shorts छिपाएँ",
      "ar": "إخفاء Shorts في كل مكان",
      "id": "Sembunyikan Shorts di mana saja"
    },
    "Open Shorts in the normal player": {
      "ja": "Shortsを通常のプレーヤーで開く",
      "zh": "用普通播放器打开 Shorts",
      "ko": "Shorts를 일반 플레이어로 열기",
      "hi": "Shorts को सामान्य प्लेयर में खोलें",
      "ar": "فتح Shorts في المشغّل العادي",
      "id": "Buka Shorts di pemutar biasa"
    },
    "Stops the endless swipe feed": {
      "ja": "無限スワイプを止める",
      "zh": "停止无尽滑动信息流",
      "ko": "끝없는 스와이프 피드 중단",
      "hi": "अंतहीन स्वाइप फ़ीड बंद",
      "ar": "يوقف التمرير اللانهائي",
      "id": "Menghentikan feed geser tanpa akhir"
    },
    "Hide Playables": {
      "ja": "Playablesを隠す",
      "zh": "隐藏 Playables",
      "ko": "Playables 숨기기",
      "hi": "Playables छिपाएँ",
      "ar": "إخفاء Playables",
      "id": "Sembunyikan Playables"
    },
    "Search": {
      "ja": "検索",
      "zh": "搜索",
      "ko": "검색",
      "hi": "खोज",
      "ar": "البحث",
      "id": "Penelusuran"
    },
    "Search box and results page.": {
      "ja": "検索ボックスと結果ページ。",
      "zh": "搜索框和结果页。",
      "ko": "검색창과 결과 페이지.",
      "hi": "खोज बॉक्स और नतीजों का पेज।",
      "ar": "مربع البحث وصفحة النتائج.",
      "id": "Kotak telusur dan halaman hasil."
    },
    "Search box": {
      "ja": "検索ボックス",
      "zh": "搜索框",
      "ko": "검색창",
      "hi": "खोज बॉक्स",
      "ar": "مربع البحث",
      "id": "Kotak telusur"
    },
    "Turn off search suggestions": {
      "ja": "検索候補をオフ",
      "zh": "关闭搜索建议",
      "ko": "검색어 제안 끄기",
      "hi": "खोज सुझाव बंद करें",
      "ar": "إيقاف اقتراحات البحث",
      "id": "Matikan saran penelusuran"
    },
    "Results": {
      "ja": "結果",
      "zh": "结果",
      "ko": "결과",
      "hi": "नतीजे",
      "ar": "النتائج",
      "id": "Hasil"
    },
    "Hide promoted results": {
      "ja": "宣伝結果を隠す",
      "zh": "隐藏推广结果",
      "ko": "프로모션 결과 숨기기",
      "hi": "प्रचारित नतीजे छिपाएँ",
      "ar": "إخفاء النتائج المروَّجة",
      "id": "Sembunyikan hasil promosi"
    },
    "Hide “People also watched” rows": {
      "ja": "「他の人はこちらも視聴しました」の行を隠す",
      "zh": "隐藏“大家还看了”行",
      "ko": "‘다른 시청자도 봄’ 행 숨기기",
      "hi": "「दूसरों ने भी देखा」 पंक्तियाँ छिपाएँ",
      "ar": "إخفاء صفوف «شاهده آخرون»",
      "id": "Sembunyikan baris “Orang lain juga menonton”"
    },
    "Hide related search chips": {
      "ja": "関連検索チップを隠す",
      "zh": "隐藏相关搜索标签",
      "ko": "관련 검색 칩 숨기기",
      "hi": "संबंधित खोज चिप छिपाएँ",
      "ar": "إخفاء شرائح البحث ذات الصلة",
      "id": "Sembunyikan chip penelusuran terkait"
    },
    "Sidebar": {
      "ja": "サイドバー",
      "zh": "侧边栏",
      "ko": "사이드바",
      "hi": "साइडबार",
      "ar": "الشريط الجانبي",
      "id": "Bilah samping"
    },
    "Pick entries to remove from the left menu.": {
      "ja": "左メニューから消す項目を選びます。",
      "zh": "选择要从左侧菜单移除的项目。",
      "ko": "왼쪽 메뉴에서 없앨 항목을 고릅니다.",
      "hi": "बाएँ मेनू से हटाने वाली चीज़ें चुनें।",
      "ar": "اختر ما تزيله من القائمة اليسرى.",
      "id": "Pilih entri yang dihapus dari menu kiri."
    },
    "Whole sidebar": {
      "ja": "サイドバー全体",
      "zh": "整个侧边栏",
      "ko": "사이드바 전체",
      "hi": "पूरा साइडबार",
      "ar": "الشريط الجانبي كله",
      "id": "Seluruh bilah samping"
    },
    "Hide sidebar and menu button": {
      "ja": "サイドバーとメニューボタンを隠す",
      "zh": "隐藏侧边栏和菜单按钮",
      "ko": "사이드바와 메뉴 버튼 숨기기",
      "hi": "साइडबार और मेनू बटन छिपाएँ",
      "ar": "إخفاء الشريط وزر القائمة",
      "id": "Sembunyikan bilah samping dan tombol menu"
    },
    "Hide the narrow icon bar": {
      "ja": "細いアイコンバーを隠す",
      "zh": "隐藏窄图标栏",
      "ko": "좁은 아이콘 막대 숨기기",
      "hi": "पतली आइकन पट्टी छिपाएँ",
      "ar": "إخفاء شريط الأيقونات الضيّق",
      "id": "Sembunyikan bilah ikon sempit"
    },
    "Main": {
      "ja": "メイン",
      "zh": "主要",
      "ko": "기본",
      "hi": "मुख्य",
      "ar": "الرئيسي",
      "id": "Utama"
    },
    "Hide this section": {
      "ja": "このセクションを隠す",
      "zh": "隐藏此部分",
      "ko": "이 섹션 숨기기",
      "hi": "यह अनुभाग छिपाएँ",
      "ar": "إخفاء هذا القسم",
      "id": "Sembunyikan bagian ini"
    },
    "Shorts": {
      "ja": "Shorts",
      "zh": "Shorts",
      "ko": "Shorts",
      "hi": "Shorts",
      "ar": "Shorts",
      "id": "Shorts"
    },
    "Expand the whole list": {
      "ja": "リスト全体を展開",
      "zh": "展开整个列表",
      "ko": "목록 전체 펼치기",
      "hi": "पूरी सूची खोलें",
      "ar": "توسيع القائمة كلها",
      "id": "Bentangkan seluruh daftar"
    },
    "You": {
      "ja": "あなた",
      "zh": "你",
      "ko": "나",
      "hi": "आप",
      "ar": "أنت",
      "id": "Anda"
    },
    "Your channel": {
      "ja": "あなたのチャンネル",
      "zh": "你的频道",
      "ko": "내 채널",
      "hi": "आपका चैनल",
      "ar": "قناتك",
      "id": "Channel Anda"
    },
    "Playlists": {
      "ja": "再生リスト",
      "zh": "播放列表",
      "ko": "재생목록",
      "hi": "प्लेलिस्ट",
      "ar": "قوائم التشغيل",
      "id": "Playlist"
    },
    "Liked videos": {
      "ja": "高く評価した動画",
      "zh": "赞过的视频",
      "ko": "좋아요 표시한 동영상",
      "hi": "पसंद किए वीडियो",
      "ar": "الفيديوهات التي أعجبتك",
      "id": "Video yang disukai"
    },
    "Your videos": {
      "ja": "あなたの動画",
      "zh": "你的视频",
      "ko": "내 동영상",
      "hi": "आपके वीडियो",
      "ar": "فيديوهاتك",
      "id": "Video Anda"
    },
    "Downloads": {
      "ja": "ダウンロード",
      "zh": "下载内容",
      "ko": "다운로드",
      "hi": "डाउनलोड",
      "ar": "التنزيلات",
      "id": "Download"
    },
    "Courses": {
      "ja": "コース",
      "zh": "课程",
      "ko": "강의",
      "hi": "कोर्स",
      "ar": "الدورات",
      "id": "Kursus"
    },
    "Clips": {
      "ja": "クリップ",
      "zh": "剪辑",
      "ko": "클립",
      "hi": "क्लिप",
      "ar": "مقاطع",
      "id": "Klip"
    },
    "“Show more” button": {
      "ja": "「もっと見る」ボタン",
      "zh": "“显示更多”按钮",
      "ko": "‘더보기’ 버튼",
      "hi": "「और दिखाएँ」 बटन",
      "ar": "زر «عرض المزيد»",
      "id": "Tombol “Tampilkan lebih banyak”"
    },
    "Explore": {
      "ja": "探索",
      "zh": "探索",
      "ko": "탐색",
      "hi": "एक्सप्लोर",
      "ar": "استكشاف",
      "id": "Jelajahi"
    },
    "Music": {
      "ja": "音楽",
      "zh": "音乐",
      "ko": "음악",
      "hi": "संगीत",
      "ar": "موسيقى",
      "id": "Musik"
    },
    "Movies": {
      "ja": "映画",
      "zh": "电影",
      "ko": "영화",
      "hi": "फ़िल्में",
      "ar": "أفلام",
      "id": "Film"
    },
    "Hype": {
      "ja": "Hype",
      "zh": "Hype",
      "ko": "Hype",
      "hi": "Hype",
      "ar": "Hype",
      "id": "Hype"
    },
    "Live": {
      "ja": "ライブ",
      "zh": "直播",
      "ko": "라이브",
      "hi": "लाइव",
      "ar": "مباشر",
      "id": "Live"
    },
    "Gaming": {
      "ja": "ゲーム",
      "zh": "游戏",
      "ko": "게임",
      "hi": "गेमिंग",
      "ar": "ألعاب",
      "id": "Game"
    },
    "News": {
      "ja": "ニュース",
      "zh": "新闻",
      "ko": "뉴스",
      "hi": "समाचार",
      "ar": "أخبار",
      "id": "Berita"
    },
    "Sports": {
      "ja": "スポーツ",
      "zh": "体育",
      "ko": "스포츠",
      "hi": "खेल",
      "ar": "رياضة",
      "id": "Olahraga"
    },
    "Podcasts": {
      "ja": "ポッドキャスト",
      "zh": "播客",
      "ko": "팟캐스트",
      "hi": "पॉडकास्ट",
      "ar": "بودكاست",
      "id": "Podcast"
    },
    "Playables": {
      "ja": "Playables",
      "zh": "Playables",
      "ko": "Playables",
      "hi": "Playables",
      "ar": "Playables",
      "id": "Playables"
    },
    "Channel support": {
      "ja": "チャンネルの支援",
      "zh": "频道支持",
      "ko": "채널 후원",
      "hi": "चैनल सहायता",
      "ar": "دعم القناة",
      "id": "Dukungan channel"
    },
    "More from YouTube": {
      "ja": "YouTube から他のサービス",
      "zh": "YouTube 的更多内容",
      "ko": "YouTube의 다른 서비스",
      "hi": "YouTube से और",
      "ar": "المزيد من YouTube",
      "id": "Lainnya dari YouTube"
    },
    "YouTube Music": {
      "ja": "YouTube Music",
      "zh": "YouTube Music",
      "ko": "YouTube Music",
      "hi": "YouTube Music",
      "ar": "YouTube Music",
      "id": "YouTube Music"
    },
    "YouTube Kids": {
      "ja": "YouTube Kids",
      "zh": "YouTube Kids",
      "ko": "YouTube Kids",
      "hi": "YouTube Kids",
      "ar": "YouTube Kids",
      "id": "YouTube Kids"
    },
    "Report history": {
      "ja": "報告履歴",
      "zh": "举报历史记录",
      "ko": "신고 기록",
      "hi": "रिपोर्ट इतिहास",
      "ar": "سجل البلاغات",
      "id": "Riwayat laporan"
    },
    "Footer links": {
      "ja": "フッターのリンク",
      "zh": "页脚链接",
      "ko": "바닥글 링크",
      "hi": "फ़ुटर लिंक",
      "ar": "روابط التذييل",
      "id": "Tautan footer"
    },
    "Top bar": {
      "ja": "トップバー",
      "zh": "顶栏",
      "ko": "상단 표시줄",
      "hi": "ऊपरी पट्टी",
      "ar": "الشريط العلوي",
      "id": "Bilah atas"
    },
    "Logo, search and account buttons.": {
      "ja": "ロゴ、検索、アカウントのボタン。",
      "zh": "标志、搜索和账号按钮。",
      "ko": "로고, 검색, 계정 버튼.",
      "hi": "लोगो, खोज और खाते के बटन।",
      "ar": "الشعار والبحث وأزرار الحساب.",
      "id": "Logo, telusur, dan tombol akun."
    },
    "Hide the entire bar": {
      "ja": "バー全体を隠す",
      "zh": "隐藏整条栏",
      "ko": "막대 전체 숨기기",
      "hi": "पूरी पट्टी छिपाएँ",
      "ar": "إخفاء الشريط كله",
      "id": "Sembunyikan seluruh bilah"
    },
    "Menu button": {
      "ja": "メニューボタン",
      "zh": "菜单按钮",
      "ko": "메뉴 버튼",
      "hi": "मेनू बटन",
      "ar": "زر القائمة",
      "id": "Tombol menu"
    },
    "Logo": {
      "ja": "ロゴ",
      "zh": "标志",
      "ko": "로고",
      "hi": "लोगो",
      "ar": "الشعار",
      "id": "Logo"
    },
    "Search bar": {
      "ja": "検索バー",
      "zh": "搜索栏",
      "ko": "검색창",
      "hi": "खोज पट्टी",
      "ar": "شريط البحث",
      "id": "Bilah telusur"
    },
    "Microphone": {
      "ja": "マイク",
      "zh": "麦克风",
      "ko": "마이크",
      "hi": "माइक्रोफ़ोन",
      "ar": "الميكروفون",
      "id": "Mikrofon"
    },
    "Create / upload": {
      "ja": "作成 / アップロード",
      "zh": "创建 / 上传",
      "ko": "만들기 / 업로드",
      "hi": "बनाएँ / अपलोड",
      "ar": "إنشاء / تحميل",
      "id": "Buat / unggah"
    },
    "Notifications": {
      "ja": "通知",
      "zh": "通知",
      "ko": "알림",
      "hi": "सूचनाएँ",
      "ar": "الإشعارات",
      "id": "Notifikasi"
    },
    "Account avatar": {
      "ja": "アカウントのアバター",
      "zh": "账号头像",
      "ko": "계정 아바타",
      "hi": "खाते का अवतार",
      "ar": "صورة الحساب",
      "id": "Avatar akun"
    },
    "Distractions": {
      "ja": "気を散らすもの",
      "zh": "干扰项",
      "ko": "방해 요소",
      "hi": "ध्यान भटकाने वाली चीज़ें",
      "ar": "عناصر التشتيت",
      "id": "Pengalih perhatian"
    },
    "Hide the unread-notification counter": {
      "ja": "未読通知の数を隠す",
      "zh": "隐藏未读通知计数",
      "ko": "읽지 않은 알림 수 숨기기",
      "hi": "ना पढ़ी सूचनाओं की गिनती छिपाएँ",
      "ar": "إخفاء عدّاد الإشعارات غير المقروءة",
      "id": "Sembunyikan jumlah notifikasi belum dibaca"
    },
    "Hide Premium offers and banners": {
      "ja": "Premiumの案内とバナーを隠す",
      "zh": "隐藏 Premium 优惠和横幅",
      "ko": "Premium 제안과 배너 숨기기",
      "hi": "Premium ऑफ़र और बैनर छिपाएँ",
      "ar": "إخفاء عروض ولافتات Premium",
      "id": "Sembunyikan tawaran dan spanduk Premium"
    },
    "Player": {
      "ja": "プレーヤー",
      "zh": "播放器",
      "ko": "플레이어",
      "hi": "प्लेयर",
      "ar": "المشغّل",
      "id": "Pemutar"
    },
    "Overlays, buttons and playback behaviour.": {
      "ja": "オーバーレイ、ボタン、再生の動作。",
      "zh": "叠层、按钮和播放行为。",
      "ko": "오버레이, 버튼, 재생 동작.",
      "hi": "ओवरले, बटन और प्लेबैक।",
      "ar": "الطبقات والأزرار وسلوك التشغيل.",
      "id": "Overlay, tombol, dan perilaku pemutaran."
    },
    "Behaviour": {
      "ja": "動作",
      "zh": "行为",
      "ko": "동작",
      "hi": "व्यवहार",
      "ar": "السلوك",
      "id": "Perilaku"
    },
    "Turn autoplay off": {
      "ja": "自動再生をオフ",
      "zh": "关闭自动播放",
      "ko": "자동재생 끄기",
      "hi": "ऑटोप्ले बंद करें",
      "ar": "إيقاف التشغيل التلقائي",
      "id": "Matikan putar otomatis"
    },
    "Next video never starts by itself": {
      "ja": "次の動画が勝手に始まらない",
      "zh": "下一个视频不会自己开始",
      "ko": "다음 동영상이 스스로 시작하지 않음",
      "hi": "अगला वीडियो अपने आप नहीं चलेगा",
      "ar": "الفيديو التالي لا يبدأ وحده",
      "id": "Video berikutnya tidak mulai sendiri"
    },
    "Start in theater mode": {
      "ja": "シアターモードで開始",
      "zh": "以影院模式开始",
      "ko": "영화관 모드로 시작",
      "hi": "थिएटर मोड में शुरू करें",
      "ar": "البدء بوضع المسرح",
      "id": "Mulai dalam mode bioskop"
    },
    "Overlays": {
      "ja": "オーバーレイ",
      "zh": "叠层",
      "ko": "오버레이",
      "hi": "ओवरले",
      "ar": "الطبقات",
      "id": "Overlay"
    },
    "End screen suggestions": {
      "ja": "終了画面のおすすめ",
      "zh": "片尾推荐",
      "ko": "종료 화면 추천",
      "hi": "अंत स्क्रीन सुझाव",
      "ar": "اقتراحات شاشة النهاية",
      "id": "Saran di layar akhir"
    },
    "“More videos” when paused": {
      "ja": "一時停止時の「他の動画」",
      "zh": "暂停时的“更多视频”",
      "ko": "일시정지 시 ‘동영상 더보기’",
      "hi": "रोकने पर «और वीडियो»",
      "ar": "«مزيد من الفيديوهات» عند الإيقاف",
      "id": "“Video lainnya” saat dijeda"
    },
    "Also the grid shown in fullscreen": {
      "ja": "全画面のグリッドも含む",
      "zh": "也包括全屏网格",
      "ko": "전체 화면 격자도 포함",
      "hi": "फ़ुलस्क्रीन की ग्रिड भी",
      "ar": "يشمل الشبكة في وضع ملء الشاشة",
      "id": "Termasuk kisi di layar penuh"
    },
    "End cards": {
      "ja": "エンドカード",
      "zh": "片尾卡片",
      "ko": "엔드 카드",
      "hi": "एंड कार्ड",
      "ar": "بطاقات النهاية",
      "id": "Kartu akhir"
    },
    "Info cards": {
      "ja": "情報カード",
      "zh": "信息卡片",
      "ko": "정보 카드",
      "hi": "जानकारी कार्ड",
      "ar": "بطاقات المعلومات",
      "id": "Kartu info"
    },
    "Channel watermark": {
      "ja": "チャンネルの透かし",
      "zh": "频道水印",
      "ko": "채널 워터마크",
      "hi": "चैनल वॉटरमार्क",
      "ar": "علامة القناة المائية",
      "id": "Tanda air channel"
    },
    "“Includes paid promotion”": {
      "ja": "「有料プロモーションを含みます」",
      "zh": "“包含付费推广”",
      "ko": "‘유료 프로모션 포함’",
      "hi": "«सशुल्क प्रचार शामिल है»",
      "ar": "«يتضمن ترويجًا مدفوعًا»",
      "id": "“Berisi promosi berbayar”"
    },
    "On-video captions": {
      "ja": "動画上の字幕",
      "zh": "视频上的字幕",
      "ko": "동영상 위 자막",
      "hi": "वीडियो पर कैप्शन",
      "ar": "الترجمة على الفيديو",
      "id": "Teks di atas video"
    },
    "Annotations": {
      "ja": "アノテーション",
      "zh": "注释",
      "ko": "주석",
      "hi": "एनोटेशन",
      "ar": "التعليقات التوضيحية",
      "id": "Anotasi"
    },
    "Title inside the player": {
      "ja": "プレーヤー内のタイトル",
      "zh": "播放器内的标题",
      "ko": "플레이어 안 제목",
      "hi": "प्लेयर के अंदर शीर्षक",
      "ar": "العنوان داخل المشغّل",
      "id": "Judul di dalam pemutar"
    },
    "Ambient glow behind the video": {
      "ja": "動画の後ろのアンビエント光",
      "zh": "视频背后的环境光",
      "ko": "동영상 뒤 주변 빛",
      "hi": "वीडियो के पीछे की चमक",
      "ar": "التوهج خلف الفيديو",
      "id": "Cahaya sekitar di belakang video"
    },
    "Progress bar": {
      "ja": "再生バー",
      "zh": "进度条",
      "ko": "진행 막대",
      "hi": "प्रगति पट्टी",
      "ar": "شريط التقدم",
      "id": "Bilah progres"
    },
    "Most replayed graph": {
      "ja": "最も再生された部分のグラフ",
      "zh": "重播最多的图表",
      "ko": "가장 많이 다시 본 구간 그래프",
      "hi": "सबसे ज़्यादा दोहराया ग्राफ़",
      "ar": "رسم الأكثر إعادة مشاهدة",
      "id": "Grafik bagian paling sering diputar ulang"
    },
    "Video time": {
      "ja": "動画の時間",
      "zh": "视频时间",
      "ko": "동영상 시간",
      "hi": "वीडियो का समय",
      "ar": "مدة الفيديو",
      "id": "Waktu video"
    },
    "Chapters": {
      "ja": "チャプター",
      "zh": "章节",
      "ko": "챕터",
      "hi": "अध्याय",
      "ar": "الفصول",
      "id": "Bab"
    },
    "Control buttons": {
      "ja": "操作ボタン",
      "zh": "控制按钮",
      "ko": "제어 버튼",
      "hi": "नियंत्रण बटन",
      "ar": "أزرار التحكم",
      "id": "Tombol kontrol"
    },
    "Play / pause": {
      "ja": "再生 / 一時停止",
      "zh": "播放 / 暂停",
      "ko": "재생 / 일시정지",
      "hi": "चलाएँ / रोकें",
      "ar": "تشغيل / إيقاف",
      "id": "Putar / jeda"
    },
    "Replay": {
      "ja": "もう一度再生",
      "zh": "重播",
      "ko": "다시 재생",
      "hi": "फिर चलाएँ",
      "ar": "إعادة التشغيل",
      "id": "Putar ulang"
    },
    "Next video": {
      "ja": "次の動画",
      "zh": "下一个视频",
      "ko": "다음 동영상",
      "hi": "अगला वीडियो",
      "ar": "الفيديو التالي",
      "id": "Video berikutnya"
    },
    "Previous video": {
      "ja": "前の動画",
      "zh": "上一个视频",
      "ko": "이전 동영상",
      "hi": "पिछला वीडियो",
      "ar": "الفيديو السابق",
      "id": "Video sebelumnya"
    },
    "Volume": {
      "ja": "音量",
      "zh": "音量",
      "ko": "볼륨",
      "hi": "आवाज़",
      "ar": "مستوى الصوت",
      "id": "Volume"
    },
    "Autoplay switch": {
      "ja": "自動再生スイッチ",
      "zh": "自动播放开关",
      "ko": "자동재생 스위치",
      "hi": "ऑटोप्ले स्विच",
      "ar": "مفتاح التشغيل التلقائي",
      "id": "Sakelar putar otomatis"
    },
    "Subtitles": {
      "ja": "字幕",
      "zh": "字幕",
      "ko": "자막",
      "hi": "सबटाइटल",
      "ar": "الترجمة",
      "id": "Subtitel"
    },
    "Settings": {
      "ja": "設定",
      "zh": "设置",
      "ko": "설정",
      "hi": "सेटिंग",
      "ar": "الإعدادات",
      "id": "Setelan"
    },
    "Miniplayer": {
      "ja": "ミニプレーヤー",
      "zh": "小窗播放器",
      "ko": "미니플레이어",
      "hi": "मिनीप्लेयर",
      "ar": "المشغّل المصغّر",
      "id": "Pemutar mini"
    },
    "Theater mode": {
      "ja": "シアターモード",
      "zh": "影院模式",
      "ko": "영화관 모드",
      "hi": "थिएटर मोड",
      "ar": "وضع المسرح",
      "id": "Mode bioskop"
    },
    "Full screen": {
      "ja": "全画面",
      "zh": "全屏",
      "ko": "전체 화면",
      "hi": "फ़ुल स्क्रीन",
      "ar": "ملء الشاشة",
      "id": "Layar penuh"
    },
    "AirPlay": {
      "ja": "AirPlay",
      "zh": "AirPlay",
      "ko": "AirPlay",
      "hi": "AirPlay",
      "ar": "AirPlay",
      "id": "AirPlay"
    },
    "“More from this channel”": {
      "ja": "「このチャンネルの他の動画」",
      "zh": "“此频道的更多内容”",
      "ko": "‘이 채널의 다른 콘텐츠’",
      "hi": "«इस चैनल से और»",
      "ar": "«المزيد من هذه القناة»",
      "id": "“Lainnya dari channel ini”"
    },
    "Video page": {
      "ja": "動画ページ",
      "zh": "视频页",
      "ko": "동영상 페이지",
      "hi": "वीडियो पेज",
      "ar": "صفحة الفيديو",
      "id": "Halaman video"
    },
    "Everything around the player.": {
      "ja": "プレーヤーの周りのすべて。",
      "zh": "播放器周围的一切。",
      "ko": "플레이어 주변의 모든 것.",
      "hi": "प्लेयर के आसपास सब कुछ।",
      "ar": "كل ما حول المشغّل.",
      "id": "Semua di sekitar pemutar."
    },
    "Right column": {
      "ja": "右カラム",
      "zh": "右栏",
      "ko": "오른쪽 열",
      "hi": "दायाँ कॉलम",
      "ar": "العمود الأيمن",
      "id": "Kolom kanan"
    },
    "Hide the entire column": {
      "ja": "カラム全体を隠す",
      "zh": "隐藏整栏",
      "ko": "열 전체 숨기기",
      "hi": "पूरा कॉलम छिपाएँ",
      "ar": "إخفاء العمود كله",
      "id": "Sembunyikan seluruh kolom"
    },
    "Related videos": {
      "ja": "関連動画",
      "zh": "相关视频",
      "ko": "관련 동영상",
      "hi": "संबंधित वीडियो",
      "ar": "فيديوهات ذات صلة",
      "id": "Video terkait"
    },
    "Live chat": {
      "ja": "ライブチャット",
      "zh": "直播聊天",
      "ko": "실시간 채팅",
      "hi": "लाइव चैट",
      "ar": "الدردشة المباشرة",
      "id": "Chat live"
    },
    "Playlist panel": {
      "ja": "再生リストパネル",
      "zh": "播放列表面板",
      "ko": "재생목록 패널",
      "hi": "प्लेलिस्ट पैनल",
      "ar": "لوحة قائمة التشغيل",
      "id": "Panel playlist"
    },
    "Fundraiser": {
      "ja": "募金",
      "zh": "筹款",
      "ko": "모금",
      "hi": "फ़ंडरेज़र",
      "ar": "جمع التبرعات",
      "id": "Penggalangan dana"
    },
    "“Up next” card": {
      "ja": "「次の動画」カード",
      "zh": "“接下来播放”卡片",
      "ko": "‘다음 동영상’ 카드",
      "hi": "«आगे» कार्ड",
      "ar": "بطاقة «التالي»",
      "id": "Kartu “Berikutnya”"
    },
    "Ads in related": {
      "ja": "関連動画の広告",
      "zh": "相关视频中的广告",
      "ko": "관련 동영상 광고",
      "hi": "संबंधित में विज्ञापन",
      "ar": "إعلانات في ذات الصلة",
      "id": "Iklan di video terkait"
    },
    "Shorts in related": {
      "ja": "関連のShorts",
      "zh": "相关内容中的 Shorts",
      "ko": "관련 Shorts",
      "hi": "संबंधित में Shorts",
      "ar": "Shorts في ذات الصلة",
      "id": "Shorts di video terkait"
    },
    "Filter chips": {
      "ja": "絞り込みチップ",
      "zh": "筛选标签",
      "ko": "필터 칩",
      "hi": "फ़िल्टर चिप",
      "ar": "شرائح التصفية",
      "id": "Chip filter"
    },
    "Title and channel": {
      "ja": "タイトルとチャンネル",
      "zh": "标题和频道",
      "ko": "제목과 채널",
      "hi": "शीर्षक और चैनल",
      "ar": "العنوان والقناة",
      "id": "Judul dan channel"
    },
    "Video title": {
      "ja": "動画タイトル",
      "zh": "视频标题",
      "ko": "동영상 제목",
      "hi": "वीडियो का शीर्षक",
      "ar": "عنوان الفيديو",
      "id": "Judul video"
    },
    "Channel avatar": {
      "ja": "チャンネルのアバター",
      "zh": "频道头像",
      "ko": "채널 아바타",
      "hi": "चैनल अवतार",
      "ar": "صورة القناة",
      "id": "Avatar channel"
    },
    "Channel name": {
      "ja": "チャンネル名",
      "zh": "频道名称",
      "ko": "채널 이름",
      "hi": "चैनल का नाम",
      "ar": "اسم القناة",
      "id": "Nama channel"
    },
    "Subscriber count": {
      "ja": "チャンネル登録者数",
      "zh": "订阅人数",
      "ko": "구독자 수",
      "hi": "सदस्य संख्या",
      "ar": "عدد المشتركين",
      "id": "Jumlah pelanggan"
    },
    "Verified badge": {
      "ja": "確認済みバッジ",
      "zh": "认证徽章",
      "ko": "인증 배지",
      "hi": "सत्यापित बैज",
      "ar": "شارة التوثيق",
      "id": "Lencana terverifikasi"
    },
    "Fundraiser badge": {
      "ja": "募金バッジ",
      "zh": "筹款徽章",
      "ko": "모금 배지",
      "hi": "फ़ंडरेज़र बैज",
      "ar": "شارة جمع التبرعات",
      "id": "Lencana penggalangan"
    },
    "Action buttons": {
      "ja": "操作ボタン",
      "zh": "操作按钮",
      "ko": "작업 버튼",
      "hi": "कार्रवाई बटन",
      "ar": "أزرار الإجراءات",
      "id": "Tombol tindakan"
    },
    "Subscribe": {
      "ja": "チャンネル登録",
      "zh": "订阅",
      "ko": "구독",
      "hi": "सदस्यता लें",
      "ar": "اشتراك",
      "id": "Subscribe"
    },
    "Notification bell": {
      "ja": "通知ベル",
      "zh": "通知铃铛",
      "ko": "알림 종",
      "hi": "सूचना घंटी",
      "ar": "جرس الإشعارات",
      "id": "Lonceng notifikasi"
    },
    "Join": {
      "ja": "参加",
      "zh": "加入",
      "ko": "가입",
      "hi": "जुड़ें",
      "ar": "انضمام",
      "id": "Gabung"
    },
    "Likes": {
      "ja": "高評価",
      "zh": "赞",
      "ko": "좋아요",
      "hi": "पसंद",
      "ar": "الإعجابات",
      "id": "Suka"
    },
    "Share": {
      "ja": "共有",
      "zh": "分享",
      "ko": "공유",
      "hi": "शेयर",
      "ar": "مشاركة",
      "id": "Bagikan"
    },
    "Download": {
      "ja": "ダウンロード",
      "zh": "下载",
      "ko": "다운로드",
      "hi": "डाउनलोड",
      "ar": "تنزيل",
      "id": "Download"
    },
    "Save": {
      "ja": "保存",
      "zh": "保存",
      "ko": "저장",
      "hi": "सेव",
      "ar": "حفظ",
      "id": "Simpan"
    },
    "Clip": {
      "ja": "クリップ",
      "zh": "剪辑",
      "ko": "클립",
      "hi": "क्लिप",
      "ar": "مقطع",
      "id": "Klip"
    },
    "Super Thanks": {
      "ja": "Super Thanks",
      "zh": "Super Thanks",
      "ko": "Super Thanks",
      "hi": "Super Thanks",
      "ar": "Super Thanks",
      "id": "Super Thanks"
    },
    "Ask (AI) button": {
      "ja": "質問（AI）ボタン",
      "zh": "提问（AI）按钮",
      "ko": "질문(AI) 버튼",
      "hi": "पूछें (AI) बटन",
      "ar": "زر اسأل (الذكاء الاصطناعي)",
      "id": "Tombol Tanya (AI)"
    },
    "Merch, tickets and offers": {
      "ja": "グッズ、チケット、オファー",
      "zh": "商品、门票和优惠",
      "ko": "상품, 티켓, 혜택",
      "hi": "मर्च, टिकट और ऑफ़र",
      "ar": "سلع وتذاكر وعروض",
      "id": "Merch, tiket, dan penawaran"
    },
    "“More” menu": {
      "ja": "「その他」メニュー",
      "zh": "“更多”菜单",
      "ko": "‘더보기’ 메뉴",
      "hi": "«और» मेनू",
      "ar": "قائمة «المزيد»",
      "id": "Menu “Lainnya”"
    },
    "Description": {
      "ja": "説明",
      "zh": "说明",
      "ko": "설명",
      "hi": "विवरण",
      "ar": "الوصف",
      "id": "Deskripsi"
    },
    "Hide description": {
      "ja": "説明を隠す",
      "zh": "隐藏说明",
      "ko": "설명 숨기기",
      "hi": "विवरण छिपाएँ",
      "ar": "إخفاء الوصف",
      "id": "Sembunyikan deskripsi"
    },
    "Expand automatically": {
      "ja": "自動で展開",
      "zh": "自动展开",
      "ko": "자동으로 펼치기",
      "hi": "अपने आप खोलें",
      "ar": "توسيع تلقائي",
      "id": "Bentangkan otomatis"
    },
    "View count": {
      "ja": "視聴回数",
      "zh": "观看次数",
      "ko": "조회수",
      "hi": "देखे जाने की संख्या",
      "ar": "عدد المشاهدات",
      "id": "Jumlah ditonton"
    },
    "Publish date": {
      "ja": "公開日",
      "zh": "发布日期",
      "ko": "게시일",
      "hi": "प्रकाशन तारीख",
      "ar": "تاريخ النشر",
      "id": "Tanggal terbit"
    },
    "Hashtags": {
      "ja": "ハッシュタグ",
      "zh": "话题标签",
      "ko": "해시태그",
      "hi": "हैशटैग",
      "ar": "الوسوم",
      "id": "Hashtag"
    },
    "Channel box": {
      "ja": "チャンネル枠",
      "zh": "频道信息框",
      "ko": "채널 상자",
      "hi": "चैनल बॉक्स",
      "ar": "مربع القناة",
      "id": "Kotak channel"
    },
    "Chapters list": {
      "ja": "チャプター一覧",
      "zh": "章节列表",
      "ko": "챕터 목록",
      "hi": "अध्यायों की सूची",
      "ar": "قائمة الفصول",
      "id": "Daftar bab"
    },
    "License and metadata rows": {
      "ja": "ライセンスとメタデータ",
      "zh": "许可和元数据",
      "ko": "라이선스와 메타데이터",
      "hi": "लाइसेंस और मेटाडेटा",
      "ar": "الترخيص والبيانات الوصفية",
      "id": "Lisensi dan metadata"
    },
    "Transcript": {
      "ja": "文字起こし",
      "zh": "转录文",
      "ko": "스크립트",
      "hi": "ट्रांसक्रिप्ट",
      "ar": "النص",
      "id": "Transkrip"
    },
    "Comments": {
      "ja": "コメント",
      "zh": "评论",
      "ko": "댓글",
      "hi": "टिप्पणियाँ",
      "ar": "التعليقات",
      "id": "Komentar"
    },
    "Hide all of it or just the noisy parts.": {
      "ja": "全部、またはうるさい部分だけ隠します。",
      "zh": "全部隐藏，或只隐藏吵闹的部分。",
      "ko": "전부 또는 시끄러운 부분만 숨깁니다.",
      "hi": "पूरा या सिर्फ़ शोर वाला हिस्सा छिपाएँ।",
      "ar": "أخفِ الكل أو الأجزاء المزعجة فقط.",
      "id": "Sembunyikan semuanya atau hanya bagian yang ramai."
    },
    "Hide the entire section": {
      "ja": "セクション全体を隠す",
      "zh": "隐藏整个版块",
      "ko": "섹션 전체 숨기기",
      "hi": "पूरा अनुभाग छिपाएँ",
      "ar": "إخفاء القسم كله",
      "id": "Sembunyikan seluruh bagian"
    },
    "Comment box": {
      "ja": "コメント欄",
      "zh": "评论框",
      "ko": "댓글 입력란",
      "hi": "टिप्पणी बॉक्स",
      "ar": "مربع التعليق",
      "id": "Kotak komentar"
    },
    "Header and count": {
      "ja": "見出しと件数",
      "zh": "标题和数量",
      "ko": "머리글과 개수",
      "hi": "शीर्षक और संख्या",
      "ar": "العنوان والعدد",
      "id": "Judul dan jumlah"
    },
    "Sort menu": {
      "ja": "並べ替えメニュー",
      "zh": "排序菜单",
      "ko": "정렬 메뉴",
      "hi": "क्रम मेनू",
      "ar": "قائمة الترتيب",
      "id": "Menu urutkan"
    },
    "Avatars": {
      "ja": "アバター",
      "zh": "头像",
      "ko": "아바타",
      "hi": "अवतार",
      "ar": "الصور الرمزية",
      "id": "Avatar"
    },
    "Replies": {
      "ja": "返信",
      "zh": "回复",
      "ko": "답글",
      "hi": "जवाब",
      "ar": "الردود",
      "id": "Balasan"
    },
    "Creator hearts": {
      "ja": "クリエイターのハート",
      "zh": "创作者爱心",
      "ko": "크리에이터 하트",
      "hi": "क्रिएटर के दिल",
      "ar": "قلوب المنشئ",
      "id": "Hati kreator"
    },
    "Badges": {
      "ja": "バッジ",
      "zh": "徽章",
      "ko": "배지",
      "hi": "बैज",
      "ar": "الشارات",
      "id": "Lencana"
    },
    "“Pinned” label": {
      "ja": "「固定」ラベル",
      "zh": "“已置顶”标签",
      "ko": "‘고정됨’ 라벨",
      "hi": "«पिन किया गया» लेबल",
      "ar": "تصنيف «مثبَّت»",
      "id": "Label “Disematkan”"
    },
    "Comment time": {
      "ja": "コメントの時刻",
      "zh": "评论时间",
      "ko": "댓글 시간",
      "hi": "टिप्पणी का समय",
      "ar": "وقت التعليق",
      "id": "Waktu komentar"
    },
    "Look": {
      "ja": "見た目",
      "zh": "外观",
      "ko": "모양",
      "hi": "रूप",
      "ar": "المظهر",
      "id": "Tampilan"
    },
    "Make YouTube less eye-catching.": {
      "ja": "YouTubeの目立ちを抑えます。",
      "zh": "让 YouTube 不那么抢眼。",
      "ko": "YouTube가 덜 눈에 띄게 합니다.",
      "hi": "YouTube कम चमकदार बने।",
      "ar": "يجعل YouTube أقل لفتًا للنظر.",
      "id": "Membuat YouTube kurang mencolok."
    },
    "Grayscale": {
      "ja": "グレースケール",
      "zh": "灰度",
      "ko": "회색조",
      "hi": "ग्रेस्केल",
      "ar": "تدرج رمادي",
      "id": "Skala abu-abu"
    },
    "Thumbnails": {
      "ja": "サムネイル",
      "zh": "缩略图",
      "ko": "썸네일",
      "hi": "थंबनेल",
      "ar": "الصور المصغرة",
      "id": "Thumbnail"
    },
    "Channel avatars": {
      "ja": "チャンネルのアバター",
      "zh": "频道头像",
      "ko": "채널 아바타",
      "hi": "चैनल अवतार",
      "ar": "صور القنوات",
      "id": "Avatar channel"
    },
    "Video player": {
      "ja": "動画プレーヤー",
      "zh": "视频播放器",
      "ko": "동영상 플레이어",
      "hi": "वीडियो प्लेयर",
      "ar": "مشغّل الفيديو",
      "id": "Pemutar video"
    },
    "The whole page": {
      "ja": "ページ全体",
      "zh": "整个页面",
      "ko": "페이지 전체",
      "hi": "पूरा पेज",
      "ar": "الصفحة كلها",
      "id": "Seluruh halaman"
    },
    "Everything, including the video": {
      "ja": "動画も含めてすべて",
      "zh": "一切，包括视频",
      "ko": "동영상 포함 전부",
      "hi": "वीडियो समेत सब कुछ",
      "ar": "كل شيء، بما فيه الفيديو",
      "id": "Semuanya, termasuk video"
    },
    "Blur thumbnails until hover": {
      "ja": "ホバーまでサムネイルをぼかす",
      "zh": "悬停前模糊缩略图",
      "ko": "가리킬 때까지 썸네일 흐리게",
      "hi": "होवर तक थंबनेल धुंधले",
      "ar": "طمس الصور المصغرة حتى المرور",
      "id": "Buramkan thumbnail sampai kursor di atas"
    },
    "Judge a video by its title, not its cover": {
      "ja": "カバーではなくタイトルで判断",
      "zh": "凭标题而不是封面判断视频",
      "ko": "표지로 말고 제목으로 판단",
      "hi": "कवर से नहीं, शीर्षक से आँकें",
      "ar": "احكم على الفيديو بعنوانه لا بغلافه",
      "id": "Nilai video dari judul, bukan sampul"
    },
    "Make thumbnails invisible": {
      "ja": "サムネイルを見えなくする",
      "zh": "使缩略图不可见",
      "ko": "썸네일을 안 보이게",
      "hi": "थंबनेल अदृश्य करें",
      "ar": "اجعل الصور المصغرة غير مرئية",
      "id": "Buat thumbnail tak terlihat"
    },
    "Hide channel avatars in feeds": {
      "ja": "フィードのチャンネルアバターを隠す",
      "zh": "隐藏信息流中的频道头像",
      "ko": "피드의 채널 아바타 숨기기",
      "hi": "फ़ीड में चैनल अवतार छिपाएँ",
      "ar": "إخفاء صور القنوات في الخلاصات",
      "id": "Sembunyikan avatar channel di feed"
    },
    "Make YouTube yours": {
      "ja": "YouTubeを自分仕様に",
      "zh": "把 YouTube 变成你的",
      "ko": "YouTube를 내 방식으로",
      "hi": "YouTube को अपना बनाएँ",
      "ar": "اجعل YouTube على طريقتك",
      "id": "Jadikan YouTube milikmu"
    },
    "Search settings…": {
      "ja": "設定を検索…",
      "zh": "搜索设置…",
      "ko": "설정 검색…",
      "hi": "सेटिंग खोजें…",
      "ar": "ابحث في الإعدادات…",
      "id": "Cari setelan…"
    },
    "Nothing matches “{q}”.": {
      "ja": "「{q}」に一致するものはありません。",
      "zh": "没有与“{q}”匹配的内容。",
      "ko": "‘{q}’와 일치하는 항목 없음.",
      "hi": "«{q}» से कुछ मेल नहीं खाता।",
      "ar": "لا شيء يطابق «{q}».",
      "id": "Tidak ada yang cocok dengan “{q}”."
    },
    "On": {
      "ja": "オン",
      "zh": "开",
      "ko": "켜짐",
      "hi": "चालू",
      "ar": "تشغيل",
      "id": "Aktif"
    },
    "Paused": {
      "ja": "一時停止",
      "zh": "已暂停",
      "ko": "일시정지",
      "hi": "रुकी हुई",
      "ar": "متوقفة",
      "id": "Dijeda"
    },
    "The extension is paused. YouTube looks the way it ships.": {
      "ja": "拡張機能は一時停止中です。YouTubeは標準の見た目です。",
      "zh": "扩展已暂停。YouTube 保持原样。",
      "ko": "확장 프로그램이 일시정지되었습니다. YouTube가 기본 모습입니다.",
      "hi": "एक्सटेंशन रुका है। YouTube वैसा ही दिखता है जैसा आता है।",
      "ar": "الإضافة متوقفة. YouTube يبدو كما هو افتراضيًا.",
      "id": "Ekstensi dijeda. YouTube tampil seperti bawaan."
    },
    "{n} active": {
      "ja": "{n} 件有効",
      "zh": "{n} 项已启用",
      "ko": "{n}개 활성",
      "hi": "{n} सक्रिय",
      "ar": "{n} مفعّلة",
      "id": "{n} aktif"
    },
    "Tools": {
      "ja": "ツール",
      "zh": "工具",
      "ko": "도구",
      "hi": "उपकरण",
      "ar": "أدوات",
      "id": "Alat"
    },
    "Hidden elements and backup.": {
      "ja": "隠した要素とバックアップ。",
      "zh": "隐藏的元素和备份。",
      "ko": "숨긴 요소와 백업.",
      "hi": "छिपे तत्व और बैकअप।",
      "ar": "العناصر المخفية والنسخة الاحتياطية.",
      "id": "Elemen tersembunyi dan cadangan."
    },
    "Applied": {
      "ja": "適用しました",
      "zh": "已应用",
      "ko": "적용됨",
      "hi": "लागू",
      "ar": "تم التطبيق",
      "id": "Diterapkan"
    },
    "Hidden elements": {
      "ja": "隠した要素",
      "zh": "隐藏的元素",
      "ko": "숨긴 요소",
      "hi": "छिपे तत्व",
      "ar": "عناصر مخفية",
      "id": "Elemen tersembunyi"
    },
    "Remove anything on YouTube with a click.": {
      "ja": "クリックでYouTubeの何でも消せます。",
      "zh": "点一下即可移除 YouTube 上的任何内容。",
      "ko": "클릭으로 YouTube의 무엇이든 없앱니다.",
      "hi": "एक क्लिक से YouTube पर कुछ भी हटाएँ।",
      "ar": "أزل أي شيء على YouTube بنقرة.",
      "id": "Hapus apa saja di YouTube dengan satu klik."
    },
    "Pick an element on the page": {
      "ja": "ページ上の要素を選ぶ",
      "zh": "在页面上选择元素",
      "ko": "페이지에서 요소 선택",
      "hi": "पेज पर तत्व चुनें",
      "ar": "اختر عنصرًا في الصفحة",
      "id": "Pilih elemen di halaman"
    },
    "Switch to a YouTube tab first (reload it if it was already open).": {
      "ja": "先にYouTubeのタブへ切り替えてください（開いていれば再読み込み）。",
      "zh": "请先切换到 YouTube 标签页（若已打开请刷新）。",
      "ko": "먼저 YouTube 탭으로 전환하세요(이미 열려 있으면 새로고침).",
      "hi": "पहले YouTube टैब पर जाएँ (खुला हो तो रीलोड करें)।",
      "ar": "انتقل أولاً إلى علامة YouTube (أعد تحميلها إن كانت مفتوحة).",
      "id": "Buka dulu tab YouTube (muat ulang jika sudah terbuka)."
    },
    "or type a CSS selector": {
      "ja": "またはCSSセレクターを入力",
      "zh": "或输入 CSS 选择器",
      "ko": "또는 CSS 선택자 입력",
      "hi": "या CSS सिलेक्टर लिखें",
      "ar": "أو اكتب محدّد CSS",
      "id": "atau ketik selektor CSS"
    },
    "Add": {
      "ja": "追加",
      "zh": "添加",
      "ko": "추가",
      "hi": "जोड़ें",
      "ar": "إضافة",
      "id": "Tambah"
    },
    "Remove": {
      "ja": "削除",
      "zh": "移除",
      "ko": "제거",
      "hi": "हटाएँ",
      "ar": "إزالة",
      "id": "Hapus"
    },
    "That is not a valid selector.": {
      "ja": "有効なセレクターではありません。",
      "zh": "这不是有效的选择器。",
      "ko": "유효한 선택자가 아닙니다.",
      "hi": "यह मान्य सिलेक्टर नहीं है।",
      "ar": "هذا ليس محدّدًا صالحًا.",
      "id": "Itu bukan selektor yang valid."
    },
    "Nothing hidden yet.": {
      "ja": "まだ何も隠していません。",
      "zh": "还没有隐藏任何内容。",
      "ko": "아직 숨긴 항목이 없습니다.",
      "hi": "अभी कुछ छिपा नहीं है।",
      "ar": "لم يُخفَ شيء بعد.",
      "id": "Belum ada yang disembunyikan."
    },
    "Backup": {
      "ja": "バックアップ",
      "zh": "备份",
      "ko": "백업",
      "hi": "बैकअप",
      "ar": "نسخة احتياطية",
      "id": "Cadangan"
    },
    "Copy this text to move your setup to another browser.": {
      "ja": "この文字列をコピーすると、別のブラウザに設定を移せます。",
      "zh": "复制这段文字即可把设置带到另一个浏览器。",
      "ko": "이 텍스트를 복사해 다른 브라우저로 설정을 옮깁니다.",
      "hi": "यह टेक्स्ट कॉपी करके सेटअप दूसरे ब्राउज़र में ले जाएँ।",
      "ar": "انسخ هذا النص لنقل إعدادك إلى متصفح آخر.",
      "id": "Salin teks ini untuk memindahkan setelan ke browser lain."
    },
    "Export": {
      "ja": "エクスポート",
      "zh": "导出",
      "ko": "내보내기",
      "hi": "एक्सपोर्ट",
      "ar": "تصدير",
      "id": "Ekspor"
    },
    "Copy": {
      "ja": "コピー",
      "zh": "复制",
      "ko": "복사",
      "hi": "कॉपी",
      "ar": "نسخ",
      "id": "Salin"
    },
    "Copied": {
      "ja": "コピーしました",
      "zh": "已复制",
      "ko": "복사됨",
      "hi": "कॉपी हो गया",
      "ar": "تم النسخ",
      "id": "Tersalin"
    },
    "Import": {
      "ja": "インポート",
      "zh": "导入",
      "ko": "가져오기",
      "hi": "इम्पोर्ट",
      "ar": "استيراد",
      "id": "Impor"
    },
    "Paste a settings string here…": {
      "ja": "設定文字列をここに貼り付け…",
      "zh": "在此粘贴设置字符串…",
      "ko": "설정 문자열을 여기에 붙여넣기…",
      "hi": "सेटिंग स्ट्रिंग यहाँ चिपकाएँ…",
      "ar": "الصق سلسلة الإعدادات هنا…",
      "id": "Tempel string setelan di sini…"
    },
    "Imported {n} settings. Previous ones were replaced.": {
      "ja": "{n} 件の設定を読み込みました。以前の設定は置き換えられました。",
      "zh": "已导入 {n} 项设置。先前的设置已被替换。",
      "ko": "설정 {n}개를 가져왔습니다. 이전 설정은 바뀌었습니다.",
      "hi": "{n} सेटिंग आयात हुईं। पिछली बदल दी गईं।",
      "ar": "تم استيراد {n} من الإعدادات. استُبدلت السابقة.",
      "id": "{n} setelan diimpor. Yang sebelumnya diganti."
    },
    "This text is not a valid settings string.": {
      "ja": "このテキストは有効な設定文字列ではありません。",
      "zh": "这段文字不是有效的设置字符串。",
      "ko": "이 텍스트는 유효한 설정 문자열이 아닙니다.",
      "hi": "यह टेक्स्ट मान्य सेटिंग स्ट्रिंग नहीं है।",
      "ar": "هذا النص ليس سلسلة إعدادات صالحة.",
      "id": "Teks ini bukan string setelan yang valid."
    },
    "Language": {
      "ja": "言語",
      "zh": "语言",
      "ko": "언어",
      "hi": "भाषा",
      "ar": "اللغة",
      "id": "Bahasa"
    },
    "Automatic": {
      "ja": "自動",
      "zh": "自动",
      "ko": "자동",
      "hi": "स्वचालित",
      "ar": "تلقائي",
      "id": "Otomatis"
    },
    "Reset everything": {
      "ja": "すべてリセット",
      "zh": "全部重置",
      "ko": "모두 초기화",
      "hi": "सब रीसेट करें",
      "ar": "إعادة ضبط الكل",
      "id": "Atur ulang semuanya"
    },
    "Reset all settings and hidden elements?": {
      "ja": "すべての設定と隠した要素をリセットしますか？",
      "zh": "重置所有设置和隐藏的元素？",
      "ko": "모든 설정과 숨긴 요소를 초기화할까요?",
      "hi": "सभी सेटिंग और छिपे तत्व रीसेट करें?",
      "ar": "إعادة ضبط كل الإعدادات والعناصر المخفية؟",
      "id": "Atur ulang semua setelan dan elemen tersembunyi?"
    },
    "Click the element to hide. Esc cancels.": {
      "ja": "隠す要素をクリック。Escでキャンセル。",
      "zh": "点击要隐藏的元素。按 Esc 取消。",
      "ko": "숨길 요소를 클릭. Esc로 취소.",
      "hi": "छिपाने के लिए तत्व पर क्लिक करें। Esc रद्द करता है।",
      "ar": "انقر العنصر لإخفائه. Esc يلغي.",
      "id": "Klik elemen yang disembunyikan. Esc membatalkan."
    },
    "Hide it": {
      "ja": "隠す",
      "zh": "隐藏",
      "ko": "숨기기",
      "hi": "छिपाएँ",
      "ar": "إخفاء",
      "id": "Sembunyikan"
    },
    "Select parent": {
      "ja": "親を選択",
      "zh": "选择父级",
      "ko": "상위 선택",
      "hi": "पैरेंट चुनें",
      "ar": "تحديد الأصل",
      "id": "Pilih induk"
    },
    "Cancel": {
      "ja": "キャンセル",
      "zh": "取消",
      "ko": "취소",
      "hi": "रद्द",
      "ar": "إلغاء",
      "id": "Batal"
    },
    "Hidden. Undo it in the extension popup → Tools.": {
      "ja": "隠しました。拡張機能のポップアップ → ツールで元に戻せます。",
      "zh": "已隐藏。在扩展弹窗 → 工具中撤销。",
      "ko": "숨겼습니다. 확장 프로그램 팝업 → 도구에서 취소.",
      "hi": "छिपा दिया। एक्सटेंशन पॉपअप → उपकरण में पूर्ववत करें।",
      "ar": "تم الإخفاء. التراجع من نافذة الإضافة → أدوات.",
      "id": "Disembunyikan. Urungkan di popup ekstensi → Alat."
    }
  };
  const T = (en, pl) => ({ en, pl, ...(EXTRA[en] || {}), ...(MORE[en] || {}) });
  const kebab = (key) => key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
  const cls = (key) => "ytc-" + kebab(key);
  const tg = (key, en, pl, o) => Object.assign({ type: "toggle", key, label: T(en, pl) }, o);
  const sl = (key, en, pl, options, o) => Object.assign({ type: "select", key, label: T(en, pl), options }, o);
  const opt = (v, en, pl) => ({ v, l: T(en, pl || en) });
  const under = (prefix, list) => list.map((s) => prefix + " " + s);

  const THUMBS = [
    "ytd-thumbnail img",
    "yt-thumbnail-view-model img",
    "yt-collection-thumbnail-view-model img",
    "ytd-playlist-thumbnail img",
    "ytd-moving-thumbnail-renderer img",
  ];
  const AVATARS = [
    "yt-avatar-shape img",
    "ytd-video-owner-renderer #avatar img",
    "#author-thumbnail img",
    "yt-decorated-avatar-view-model img",
    "ytd-guide-entry-renderer yt-img-shadow img",
    "ytd-mini-guide-entry-renderer yt-img-shadow img",
    "ytd-topbar-menu-button-renderer yt-img-shadow img",
  ];
  const HOME = 'ytd-browse[page-subtype="home"]';

  /* ---------------------------------------------------------------- panels */

  const PANELS = [
    {
      id: "home",
      icon: '<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.8V20h13V9.8"/>',
      title: T("Home", "Strona główna"),
      desc: T("What you see when YouTube opens.", "Co widzisz po otwarciu YouTube."),
      sections: [
        {
          title: T("Start", "Start"),
          items: [
            sl("homeRedirect", "Open instead of Home", "Zamiast strony głównej otwieraj", [
              opt("home", "Home", "Stronę główną"),
              opt("subscriptions", "Subscriptions", "Subskrypcje"),
              opt("history", "History", "Historię"),
              opt("library", "Library", "Bibliotekę"),
              opt("watchLater", "Watch later", "Do obejrzenia"),
            ], {
              def: "home",
              hint: T("Only when YouTube opens. The logo still opens Home.", "Tylko przy otwarciu YouTube. Logo nadal otwiera stronę główną."),
            }),
            sl("columns", "Videos per row", "Filmów w rzędzie", [
              opt(0, "YouTube default", "Domyślnie"),
              opt(3, "3"), opt(4, "4"), opt(5, "5"), opt(6, "6"), opt(7, "7"),
            ], { def: 4 }),
          ],
        },
        {
          title: T("Recommendations", "Rekomendacje"),
          items: [
            tg("hideSuggestions", "Hide the recommended feed", "Ukryj polecane filmy", {
              hint: T("Leaves the Home page empty", "Strona główna zostaje pusta"),
              hide: [HOME + " ytd-rich-grid-renderer > #contents > ytd-rich-item-renderer"],
            }),
            tg("hideMixes", "Hide playlists and mixes", "Ukryj playlisty i miksy", {
              hide: [
                HOME + ' ytd-rich-item-renderer:has(a[href*="list=RD"])',
                HOME + ' ytd-rich-item-renderer:has(a[href*="start_radio=1"])',
                HOME + ' ytd-rich-item-renderer:has(a[href*="/playlist?list="])',
                HOME + " ytd-rich-item-renderer:has(ytd-playlist-thumbnail)",
                HOME + " ytd-rich-item-renderer:has(yt-collection-thumbnail-view-model)",
                HOME + ' ytd-rich-section-renderer:has(a[href*="/playlist?list="])',
              ],
            }),
            tg("hideAds", "Hide ads in the feed", "Ukryj reklamy w feedzie", {
              hint: T("Promoted tiles and banners only", "Tylko kafelki i banery promowane"),
              hide: [
                HOME + " ytd-ad-slot-renderer",
                HOME + " ytd-display-ad-renderer",
                HOME + " ytd-banner-promo-renderer",
                HOME + " ytd-in-feed-ad-layout-renderer",
                HOME + " ytd-rich-item-renderer:has(ytd-ad-slot-renderer)",
                HOME + ' ytd-rich-item-renderer:has([aria-label="Reklama"])',
                HOME + ' ytd-rich-item-renderer:has([aria-label="Sponsorowane"])',
                HOME + ' ytd-rich-item-renderer:has([aria-label="Sponsored"])',
                HOME + ' ytd-rich-item-renderer:has([aria-label="Ad"])',
                "#masthead-ad",
                "ytd-primetime-promo-renderer",
              ],
            }),
            tg("hideFeedChips", "Hide the topic chips bar", "Ukryj pasek kategorii", {
              hide: ["ytd-feed-filter-chip-bar-renderer", "ytd-rich-grid-renderer #chips-wrapper"],
            }),
            tg("hideHomeShelves", "Hide extra shelves", "Ukryj dodatkowe sekcje", {
              hint: T("News, posts, Shorts rows between videos", "Wiadomości, posty, rzędy Shorts między filmami"),
              hide: [HOME + " ytd-rich-section-renderer"],
            }),
            tg("hideCommunityPosts", "Hide community posts", "Ukryj posty społeczności", {
              hide: [
                "ytd-rich-section-renderer:has(ytd-post-renderer)",
                "ytd-rich-item-renderer:has(ytd-post-renderer)",
              ],
            }),
            tg("hideHoverPreview", "Turn off hover previews", "Wyłącz podglądy po najechaniu", {
              hint: T("No video playing inside thumbnails", "Bez odtwarzania filmu w miniaturze"),
              hide: ["ytd-video-preview", "ytd-moving-thumbnail-renderer"],
            }),
          ],
        },
        {
          title: T("Shorts and Playables", "Shorts i gry"),
          items: [
            tg("hideShorts", "Hide Shorts everywhere", "Ukryj Shorts wszędzie", {
              def: true,
              hide: [
                '[data-ytc-hide="shorts"]',
                "ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])",
                "ytd-rich-shelf-renderer[is-shorts]",
                "ytd-reel-shelf-renderer",
                'ytd-guide-entry-renderer:has(a[href="/shorts"])',
                'ytd-mini-guide-entry-renderer:has(a[href="/shorts"])',
                'ytd-rich-item-renderer:has(a[href^="/shorts/"])',
                'ytd-video-renderer:has(a[href^="/shorts/"])',
                'ytd-grid-video-renderer:has(a[href^="/shorts/"])',
                'ytd-compact-video-renderer:has(a[href^="/shorts/"])',
                'yt-lockup-view-model:has(a[href^="/shorts/"])',
                "ytm-shorts-lockup-view-model",
                "ytm-shorts-lockup-view-model-v2",
              ],
            }),
            tg("redirectShorts", "Open Shorts in the normal player", "Otwieraj Shorts w zwykłym odtwarzaczu", {
              hint: T("Stops the endless swipe feed", "Koniec z nieskończonym przewijaniem"),
            }),
            tg("hideGames", "Hide Playables", "Ukryj Pokój gier", {
              def: true,
              hide: [
                '[data-ytc-hide="games"]',
                'ytd-rich-section-renderer:has(a[href="/playables"])',
                'ytd-rich-section-renderer:has(a[href^="/playables"])',
                'ytd-guide-entry-renderer:has(a[href="/playables"])',
                'ytd-guide-entry-renderer:has(a[href^="/playables"])',
                'ytd-mini-guide-entry-renderer:has(a[href="/playables"])',
                'ytd-mini-guide-entry-renderer:has(a[href^="/playables"])',
              ],
            }),
          ],
        },
      ],
    },

    {
      id: "search",
      icon: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.9-4.9"/>',
      title: T("Search", "Wyszukiwanie"),
      desc: T("Search box and results page.", "Wyszukiwarka i strona wyników."),
      sections: [
        {
          title: T("Search box", "Pole wyszukiwania"),
          items: [
            tg("hideSearchSuggestions", "Turn off search suggestions", "Wyłącz podpowiedzi wyszukiwania", {
              hide: [
                "ytd-searchbox #suggestions",
                ".ytSearchboxComponentSuggestionsContainer",
                'yt-searchbox [role="listbox"]',
                ".ytSuggestionComponentSuggestion",
              ],
            }),
          ],
        },
        {
          title: T("Results", "Wyniki"),
          items: [
            tg("hideSearchAds", "Hide promoted results", "Ukryj wyniki promowane", {
              hide: [
                "ytd-search ytd-ad-slot-renderer",
                "ytd-search ytd-search-pyv-renderer",
                "ytd-search ytd-promoted-sparkles-text-search-renderer",
                "ytd-search ytd-promoted-video-renderer",
              ],
            }),
            tg("hideSearchShelves", "Hide “People also watched” rows", "Ukryj rzędy „Inni oglądali”", {
              hide: ["ytd-search ytd-shelf-renderer", "ytd-search ytd-horizontal-card-list-renderer"],
            }),
            tg("hideSearchChips", "Hide related search chips", "Ukryj podpowiedziane frazy", {
              hide: ["ytd-search yt-related-chip-cloud-renderer", "ytd-search ytd-feed-filter-chip-bar-renderer"],
            }),
          ],
        },
      ],
    },

    {
      id: "guide",
      icon: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M9.5 4.5v15"/>',
      title: T("Sidebar", "Panel boczny"),
      desc: T("Pick entries to remove from the left menu.", "Wybierz pozycje do usunięcia z lewego menu."),
      sections: [
        {
          title: T("Whole sidebar", "Cały panel"),
          items: [
            tg("hideSidebar", "Hide sidebar and menu button", "Ukryj panel i przycisk menu", {
              css:
                "& ytd-guide-renderer,& ytd-mini-guide-renderer,& tp-yt-app-drawer#guide,& ytd-masthead #guide-button{display:none!important}" +
                "& ytd-app{--ytd-mini-guide-width:0px!important}& ytd-page-manager{margin-left:0!important}",
            }),
            tg("hideMiniGuide", "Hide the narrow icon bar", "Ukryj wąski pasek ikon", {
              css:
                "& ytd-mini-guide-renderer{display:none!important}" +
                "& ytd-app{--ytd-mini-guide-width:0px!important}& ytd-page-manager{margin-left:0!important}",
            }),
          ],
        },
        {
          title: T("Main", "Główne"),
          master: tg("hideHomeSection", "Hide this section", "Ukryj całą sekcję"),
          items: [
            tg("hideGuideHome", "Home", "Strona główna"),
            tg("hideGuideShorts", "Shorts", "Shorts"),
          ],
        },
        {
          title: T("Subscriptions", "Subskrypcje"),
          master: tg("hideSubscriptionsSection", "Hide this section", "Ukryj całą sekcję"),
          items: [
            tg("hideGuideSubscriptions", "Subscriptions", "Subskrypcje"),
            tg("expandSubscriptions", "Expand the whole list", "Rozwiń całą listę"),
          ],
        },
        {
          title: T("You", "Ty"),
          master: tg("hideLibrarySection", "Hide this section", "Ukryj całą sekcję"),
          items: [
            tg("hideGuideYou", "You", "Ty"),
            tg("hideGuideChannel", "Your channel", "Twój kanał"),
            tg("hideGuideHistory", "History", "Historia"),
            tg("hideGuidePlaylists", "Playlists", "Playlisty"),
            tg("hideGuideWatchLater", "Watch later", "Do obejrzenia"),
            tg("hideGuideLiked", "Liked videos", "Polubione filmy"),
            tg("hideGuideYourVideos", "Your videos", "Twoje filmy"),
            tg("hideGuideDownloads", "Downloads", "Pobrane"),
            tg("hideGuideCourses", "Courses", "Kursy"),
            tg("hideGuideClips", "Clips", "Klipy"),
            tg("hideGuideLibraryShowMore", "“Show more” button", "Przycisk „Pokaż więcej”"),
          ],
        },
        {
          title: T("Explore", "Odkrywaj"),
          master: tg("hideExploreSection", "Hide this section", "Ukryj całą sekcję"),
          items: [
            tg("hideGuideExploreMusic", "Music", "Muzyka"),
            tg("hideGuideMovies", "Movies", "Filmy"),
            tg("hideGuideHype", "Hype", "Podbijanie"),
            tg("hideGuideLive", "Live", "Na żywo"),
            tg("hideGuideGaming", "Gaming", "Gry"),
            tg("hideGuideNews", "News", "Wiadomości"),
            tg("hideGuideSports", "Sports", "Sport"),
            tg("hideGuidePodcasts", "Podcasts", "Podcasty"),
            tg("hideGuidePlayables", "Playables", "Pokój gier"),
            tg("hideGuideSupport", "Channel support", "Wspieranie kanału"),
            tg("hideGuideExploreShowMore", "“Show more” button", "Przycisk „Pokaż więcej”"),
          ],
        },
        {
          title: T("More from YouTube", "Więcej z YouTube"),
          master: tg("hideMoreSection", "Hide this section", "Ukryj całą sekcję"),
          items: [
            tg("hideGuideMusic", "YouTube Music", "YouTube Music"),
            tg("hideGuideKids", "YouTube Kids", "YouTube Kids"),
            tg("hideGuideReports", "Report history", "Historia zgłoszeń"),
            tg("hideGuideFooter", "Footer links", "Linki w stopce"),
          ],
        },
      ],
    },

    {
      id: "topbar",
      icon: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M3.5 9.5h17"/>',
      title: T("Top bar", "Górny pasek"),
      desc: T("Logo, search and account buttons.", "Logo, wyszukiwarka i przyciski konta."),
      sections: [
        {
          title: T("Top bar", "Górny pasek"),
          master: tg("hideMasthead", "Hide the entire bar", "Ukryj cały pasek", {
            css:
              "&,& ytd-app{--ytd-toolbar-height:0px!important;--ytd-masthead-height:0px!important}" +
              "& ytd-masthead,& #masthead-container{display:none!important}",
          }),
          items: [
            tg("hideMastheadMenu", "Menu button", "Przycisk menu", { hide: ["ytd-masthead #guide-button"] }),
            tg("hideMastheadLogo", "Logo", "Logo", {
              hide: ["ytd-masthead ytd-topbar-logo-renderer", "ytd-masthead #logo", "ytd-masthead a#logo"],
            }),
            tg("hideMastheadSearch", "Search bar", "Wyszukiwarka", {
              hide: [
                "ytd-masthead ytd-searchbox form",
                "ytd-masthead yt-searchbox .ytSearchboxComponentInputBox",
                "ytd-masthead yt-searchbox .ytSearchboxComponentSearchButton",
                "ytd-masthead #search-form",
              ],
            }),
            tg("hideMastheadMic", "Microphone", "Mikrofon", {
              hide: [
                "ytd-masthead #voice-search-button",
                "ytd-masthead .ytSearchboxComponentVoiceSearchButton",
                'ytd-masthead button[aria-label*="Wyszukiwanie głosowe" i]',
                'ytd-masthead button[aria-label*="Voice search" i]',
              ],
            }),
            tg("hideMastheadUpload", "Create / upload", "Utwórz / prześlij", {
              hide: [
                "ytd-masthead #buttons > ytd-topbar-menu-button-renderer:not(:has(#avatar-btn))",
                "ytd-masthead #upload-btn",
                'ytd-masthead a[href="/upload"]',
                "[data-ytc-upload]",
              ],
            }),
            tg("hideMastheadNotifications", "Notifications", "Powiadomienia", {
              hide: [
                "ytd-notification-topbar-button-renderer",
                'ytd-masthead button[aria-label*="Powiadomienia" i]',
                'ytd-masthead button[aria-label*="Notifications" i]',
              ],
            }),
            tg("hideMastheadAvatar", "Account avatar", "Awatar konta", {
              hide: [
                "ytd-masthead button#avatar-btn",
                "ytd-masthead #avatar-btn",
                "ytd-masthead ytd-topbar-menu-button-renderer:has(#avatar-btn)",
              ],
            }),
          ],
        },
        {
          title: T("Distractions", "Rozpraszacze"),
          items: [
            tg("hideNotificationBadge", "Hide the unread-notification counter", "Ukryj licznik powiadomień", {
              hide: [
                "ytd-masthead .yt-spec-icon-badge-shape__badge",
                "ytd-notification-topbar-button-renderer .yt-spec-icon-badge-shape__badge",
                "ytd-notification-topbar-button-renderer #notification-count",
              ],
            }),
            tg("hidePremiumPromos", "Hide Premium offers and banners", "Ukryj oferty i banery Premium", {
              hide: [
                "ytd-mealbar-promo-renderer",
                "ytd-statement-banner-renderer",
                "ytd-banner-promo-renderer",
                'ytd-guide-entry-renderer:has(a[href*="/premium"])',
                'ytd-masthead #buttons ytd-button-renderer:has(a[href*="/premium"])',
              ],
            }),
          ],
        },
      ],
    },

    {
      id: "player",
      icon: '<rect x="3.5" y="5.5" width="17" height="13" rx="3"/><path d="m10.5 9.5 4 2.5-4 2.5z"/>',
      title: T("Player", "Odtwarzacz"),
      desc: T("Overlays, buttons and playback behaviour.", "Nakładki, przyciski i zachowanie odtwarzania."),
      sections: [
        {
          title: T("Behaviour", "Zachowanie"),
          items: [
            tg("disableAutoplay", "Turn autoplay off", "Wyłącz autoodtwarzanie", {
              hint: T("Next video never starts by itself", "Następny film nie włącza się sam"),
            }),
            tg("autoTheater", "Start in theater mode", "Zaczynaj w trybie kinowym"),
          ],
        },
        {
          title: T("Overlays", "Nakładki"),
          items: [
            tg("hideEndscreen", "End screen suggestions", "Propozycje po zakończeniu filmu", {
              hide: [
                ".ytp-endscreen-content", ".html5-endscreen", ".ytp-modern-endscreen", ".videowall-endscreen",
                ".ytp-videowall-still", ".ytp-endscreen-previous", ".ytp-endscreen-next", ".ytp-suggestion-set",
                ".ytp-fullscreen-grid-stills-container", ".ytp-autonav-endscreen-countdown-container",
              ],
            }),
            tg("hidePauseOverlay", "“More videos” when paused", "„Więcej filmów” po zatrzymaniu", {
              hint: T("Also the grid shown in fullscreen", "Także siatka w pełnym ekranie"),
              hide: [".ytp-pause-overlay", ".ytp-pause-overlay-container", ".ytp-fullscreen-grid"],
            }),
            tg("hideEndCards", "End cards", "Karty końcowe", {
              hide: [".ytp-ce-element", ".ytp-ce-covering-overlay", ".ytp-ce-element-shadow", ".ytp-ce-video", ".ytp-ce-playlist", ".ytp-ce-channel"],
            }),
            tg("hideInfoCards", "Info cards", "Karty informacyjne", {
              hide: [".ytp-cards-teaser", ".ytp-cards-button", ".ytp-cards-teaser-box"],
            }),
            tg("hideWatermark", "Channel watermark", "Znak wodny kanału", {
              hide: [".iv-branding", ".ytp-watermark"],
            }),
            tg("hidePaidPromotion", "“Includes paid promotion”", "„Zawiera płatną promocję”", {
              hide: [".ytp-paid-content-overlay", ".ytp-paid-content-overlay-text"],
            }),
            tg("hideCaptions", "On-video captions", "Napisy na filmie", {
              hide: [".ytp-caption-window-container", ".caption-window"],
            }),
            tg("hideAnnotations", "Annotations", "Adnotacje", {
              hide: [".annotation", ".ytp-ad-overlay-slot", ".ytp-ad-overlay-container"],
            }),
            tg("hidePlayerTitle", "Title inside the player", "Tytuł w odtwarzaczu", {
              hide: [".ytp-title", ".ytp-title-text", ".ytp-chrome-top .ytp-title-channel"],
            }),
            tg("hideAmbientMode", "Ambient glow behind the video", "Poświata za filmem", {
              hide: ["ytd-watch-flexy #cinematics", "ytd-watch-flexy #cinematics-container"],
            }),
          ],
        },
        {
          title: T("Progress bar", "Pasek postępu"),
          items: [
            tg("hideProgressBar", "Progress bar", "Pasek postępu", { hide: [".ytp-progress-bar-container"] }),
            tg("hideHeatmap", "Most replayed graph", "Wykres najczęściej oglądanych", {
              hide: [".ytp-heat-map-container", ".ytp-heat-map-chapter"],
            }),
            tg("hidePlayerTime", "Video time", "Czas filmu", { hide: [".ytp-time-display"] }),
            tg("hideChapters", "Chapters", "Rozdziały", {
              hide: [".ytp-chapter-container", ".ytp-chapter-title", ".ytp-chapter-hover-container"],
            }),
          ],
        },
        {
          title: T("Control buttons", "Przyciski sterowania"),
          items: [
            tg("hidePlayButton", "Play / pause", "Odtwarzaj / pauza", { hide: [".ytp-play-button"] }),
            tg("hideReplayButton", "Replay", "Powtórz", {
              hide: [".html5-video-player.ended .ytp-play-button", ".ytp-replay-button"],
            }),
            tg("hideNextButton", "Next video", "Następny film", { hide: [".ytp-next-button"] }),
            tg("hidePrevButton", "Previous video", "Poprzedni film", { hide: [".ytp-prev-button"] }),
            tg("hideVolume", "Volume", "Głośność", { hide: [".ytp-volume-area", ".ytp-mute-button", ".ytp-volume-panel"] }),
            tg("hideAutonavButton", "Autoplay switch", "Przełącznik autoodtwarzania", {
              hide: [".ytp-autonav-toggle-button", ".ytp-autonav-toggle-button-container"],
            }),
            tg("hideSubtitlesButton", "Subtitles", "Napisy", { hide: [".ytp-subtitles-button"] }),
            tg("hideSettingsButton", "Settings", "Ustawienia", { hide: [".ytp-settings-button"] }),
            tg("hideMiniplayer", "Miniplayer", "Miniodtwarzacz", { hide: [".ytp-miniplayer-button"] }),
            tg("hideTheaterButton", "Theater mode", "Tryb kinowy", { hide: [".ytp-size-button"] }),
            tg("hideFullscreen", "Full screen", "Pełny ekran", { hide: [".ytp-fullscreen-button"] }),
            tg("hideAirplay", "AirPlay", "AirPlay", {
              hide: [".ytp-airplay-button", '.ytp-button[aria-label*="AirPlay" i]'],
            }),
            tg("hideMoreFromChannel", "“More from this channel”", "„Więcej z tego kanału”", {
              hide: ['[data-ytc-part="more-channel"]'],
            }),
          ],
        },
      ],
    },

    {
      id: "video",
      icon: '<path d="M5 4.5h14v15H5z"/><path d="M8.5 9h7M8.5 12.5h7M8.5 16h4"/>',
      title: T("Video page", "Strona filmu"),
      desc: T("Everything around the player.", "Wszystko wokół odtwarzacza."),
      sections: [
        {
          title: T("Right column", "Prawa kolumna"),
          master: tg("hideSecondary", "Hide the entire column", "Ukryj całą kolumnę", {
            css:
              "& ytd-watch-flexy #secondary{display:none!important}" +
              "& ytd-watch-flexy #primary{max-width:none!important;margin-right:0!important}",
          }),
          items: [
            tg("hideRelated", "Related videos", "Podobne filmy", {
              hide: ["ytd-watch-flexy #related", "ytd-watch-flexy ytd-watch-next-secondary-results-renderer", "ytd-watch-flexy #secondary ytd-item-section-renderer"],
            }),
            tg("hideLiveChat", "Live chat", "Czat na żywo", {
              hide: [
                "ytd-live-chat-frame", "ytd-watch-flexy #chat", "ytd-watch-flexy #chat-container",
                'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-live-chat"]',
              ],
            }),
            tg("hideWatchPlaylist", "Playlist panel", "Panel playlisty", {
              hide: ["ytd-playlist-panel-renderer", "ytd-watch-flexy #playlist"],
            }),
            tg("hideFundraiser", "Fundraiser", "Zbiórka", {
              hide: ["ytd-donation-shelf-renderer", "ytd-fundraiser-shelf-renderer", "ytd-watch-flexy #donation-shelf"],
            }),
            tg("hideAutoplayCard", "“Up next” card", "Karta „Następne”", { hide: ["ytd-compact-autoplay-renderer"] }),
            tg("hideRelatedAds", "Ads in related", "Reklamy w podobnych", {
              hide: [
                "ytd-watch-flexy #secondary ytd-ad-slot-renderer",
                "ytd-watch-flexy #secondary ytd-display-ad-renderer",
                "ytd-watch-flexy #secondary ytd-compact-promoted-video-renderer",
                "ytd-watch-flexy #secondary ytd-promoted-sparkles-web-renderer",
              ],
            }),
            tg("hideRelatedShorts", "Shorts in related", "Shorts w podobnych", {
              hide: [
                "ytd-watch-flexy #secondary ytd-reel-shelf-renderer",
                "ytd-watch-flexy #secondary ytd-rich-shelf-renderer[is-shorts]",
                "ytd-watch-flexy #secondary ytd-reel-item-renderer",
              ],
            }),
            tg("hideRelatedChips", "Filter chips", "Filtry (chipy)", {
              hide: [
                "ytd-watch-flexy #secondary yt-related-chip-cloud-renderer",
                "ytd-watch-flexy #secondary yt-chip-cloud-view-model",
                "ytd-watch-flexy #secondary ytd-watch-next-secondary-results-renderer #chips",
              ],
            }),
          ],
        },
        {
          title: T("Title and channel", "Tytuł i kanał"),
          items: [
            tg("hideVideoTitle", "Video title", "Tytuł filmu", { hide: ["ytd-watch-metadata #title", "ytd-watch-metadata h1"] }),
            tg("hideChannelAvatar", "Channel avatar", "Awatar kanału", {
              hide: ["ytd-video-owner-renderer #avatar", "ytd-video-owner-renderer yt-img-shadow", "ytd-video-owner-renderer yt-avatar-shape", "#owner #avatar"],
            }),
            tg("hideChannelName", "Channel name", "Nazwa kanału", {
              hide: ["ytd-video-owner-renderer ytd-channel-name", "#owner #channel-name", "#upload-info ytd-channel-name"],
            }),
            tg("hideSubCount", "Subscriber count", "Liczba subskrybentów", {
              hide: ["#owner-sub-count", "#subscriber-count", "ytd-video-owner-renderer #owner-sub-count"],
            }),
            tg("hideVerifiedBadge", "Verified badge", "Znaczek weryfikacji", {
              hide: ["ytd-video-owner-renderer ytd-badge-supported-renderer", "ytd-channel-name #badge", ".badge-style-type-verified", ".badge-style-type-verified-artist"],
            }),
            tg("hideFundraiserBadge", "Fundraiser badge", "Znaczek zbiórki", {
              hide: ['[data-ytc-part="fundraiser-badge"]', "ytd-video-owner-renderer ytd-donation-shelf-renderer"],
            }),
          ],
        },
        {
          title: T("Action buttons", "Przyciski akcji"),
          items: [
            tg("hideSubscribe", "Subscribe", "Subskrybuj", { hide: ["ytd-watch-metadata #subscribe-button", '[data-ytc-part="subscribe"]'] }),
            tg("hideNotifyBell", "Notification bell", "Dzwonek", { hide: ["ytd-watch-metadata #notification-preference-button", '[data-ytc-part="notify"]'] }),
            tg("hideJoin", "Join", "Dołącz", { hide: ["ytd-watch-metadata #sponsor-button", '[data-ytc-part="join"]'] }),
            tg("hideLikeBar", "Likes", "Polubienia", {
              hide: [
                "ytd-watch-metadata ytd-segmented-like-dislike-button-renderer",
                "ytd-watch-metadata like-button-view-model",
                "ytd-watch-metadata segmented-like-dislike-button-view-model",
                "ytd-watch-metadata #segmented-like-button",
              ],
            }),
            tg("hideShare", "Share", "Udostępnij", { hide: ['[data-ytc-part="share"]'] }),
            tg("hideDownload", "Download", "Pobierz", { hide: ['[data-ytc-part="download"]'] }),
            tg("hideSave", "Save", "Zapisz", { hide: ['[data-ytc-part="save"]'] }),
            tg("hideClip", "Clip", "Klip", { hide: ['[data-ytc-part="clip"]'] }),
            tg("hideThanks", "Super Thanks", "Super Thanks", { hide: ['[data-ytc-part="thanks"]'] }),
            tg("hideAsk", "Ask (AI) button", "Przycisk Zapytaj (AI)", { hide: ['[data-ytc-part="ask"]'] }),
            tg("hideOffers", "Merch, tickets and offers", "Gadżety, bilety i oferty", {
              hide: [
                "ytd-merch-shelf-renderer", "ytd-ticket-shelf-renderer", "ytd-offer-module-renderer", "#ticket-shelf",
                "ytd-products-in-video-renderer", '[data-ytc-part="offers"]',
              ],
            }),
            tg("hideMoreActions", "“More” menu", "Menu „Więcej”", {
              hide: [
                'ytd-watch-metadata #actions button[aria-label="Więcej"]',
                'ytd-watch-metadata #actions button[aria-label="More"]',
                'ytd-watch-metadata #actions button[aria-label="More actions"]',
                'ytd-watch-metadata #actions button[aria-label*="Więcej działań" i]',
              ],
            }),
          ],
        },
        {
          title: T("Description", "Opis"),
          items: [
            tg("hideDescription", "Hide description", "Ukryj opis", {
              hide: ["ytd-watch-metadata #description", "ytd-watch-metadata ytd-text-inline-expander", "ytd-watch-metadata ytd-expander", "ytd-watch-metadata #description-inline-expander"],
            }),
            tg("expandDescription", "Expand automatically", "Rozwijaj automatycznie"),
            tg("hideViewCount", "View count", "Liczba wyświetleń", {
              hide: ["ytd-watch-metadata #view-count", '[data-ytc-part="views"]', '[data-ytc-part="views-date"]', "ytd-video-view-count-renderer"],
            }),
            tg("hidePublishDate", "Publish date", "Data publikacji", {
              hide: ["ytd-watch-metadata #date", '[data-ytc-part="date"]'],
              css: "&:not(.ytc-hide-view-count) ytd-watch-metadata [data-ytc-part=\"views-date\"]{display:none!important}",
            }),
            tg("hideHashtags", "Hashtags", "Hashtagi", {
              hide: ['ytd-watch-metadata a[href*="/hashtag/"]', 'ytd-watch-metadata yt-formatted-string a[href*="/hashtag/"]'],
            }),
            tg("hideChannelInfo", "Channel box", "Ramka kanału", {
              hide: ["ytd-structured-description-channel-lockup-renderer", "ytd-video-secondary-info-renderer #channel"],
            }),
            tg("hideDescriptionChapters", "Chapters list", "Lista rozdziałów", {
              hide: [
                "ytd-macro-markers-list-renderer",
                'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-macro-markers-description-chapters"]',
                "ytd-watch-metadata ytd-horizontal-card-list-renderer",
              ],
            }),
            tg("hideLicenseRow", "License and metadata rows", "Licencja i metadane", {
              hide: [
                "ytd-watch-metadata ytd-metadata-row-container-renderer", "ytd-watch-metadata ytd-metadata-row-renderer",
                "ytd-watch-metadata ytd-rich-metadata-renderer", "ytd-watch-metadata #super-title", '[data-ytc-part="license"]',
              ],
            }),
            tg("hideTranscript", "Transcript", "Transkrypcja", {
              hide: [
                '[data-ytc-part="transcript"]', "ytd-video-description-transcript-section-renderer", "ytd-transcript-renderer",
                "ytd-transcript-search-panel-renderer", 'ytd-engagement-panel-section-list-renderer[target-id*="transcript"]',
              ],
            }),
          ],
        },
      ],
    },

    {
      id: "comments",
      icon: '<path d="M4.5 5.5h15v10.5H10l-4.5 3.5V16h-1z"/>',
      title: T("Comments", "Komentarze"),
      desc: T("Hide all of it or just the noisy parts.", "Ukryj całość albo tylko hałaśliwe elementy."),
      sections: [
        {
          title: T("Comments", "Komentarze"),
          master: tg("hideComments", "Hide the entire section", "Ukryj całą sekcję", {
            hide: ["ytd-comments", "ytd-watch-flexy #comments"],
          }),
          items: [
            tg("hideCommentBox", "Comment box", "Pole dodawania komentarza", {
              hide: ["ytd-comment-simplebox-renderer", "ytd-commentbox", "ytd-comments #simple-box"],
            }),
            tg("hideCommentHeader", "Header and count", "Nagłówek i liczba", {
              hide: ["ytd-comments-header-renderer #title", "ytd-comments-header-renderer #count", "ytd-comments-header-renderer h2"],
            }),
            tg("hideCommentSort", "Sort menu", "Sortowanie", {
              hide: ["ytd-comments-header-renderer #sort-menu", "ytd-comments-header-renderer #sort-menu-anchor"],
            }),
            tg("hideCommentAvatars", "Avatars", "Awatary", {
              hide: ["ytd-comment-renderer #author-thumbnail", "ytd-comment-view-model #author-thumbnail", "ytd-comment-replies-renderer #author-thumbnail", "ytd-comment-thread-renderer #author-thumbnail"],
            }),
            tg("hideCommentLikes", "Likes", "Polubienia", {
              hide: ["ytd-comment-renderer #vote-count-middle", "ytd-comment-action-buttons-renderer #like-button", "ytd-comment-action-buttons-renderer #dislike-button", "ytd-comment-engagement-bar"],
            }),
            tg("hideCommentReplies", "Replies", "Odpowiedzi", {
              hide: ["ytd-comment-replies-renderer", "ytd-comment-renderer #reply-button-end", "ytd-comment-action-buttons-renderer #reply-button"],
            }),
            tg("hideCommentHearts", "Creator hearts", "Serduszka autora", {
              hide: ["ytd-creator-heart-renderer", "#creator-heart", "ytd-comment-renderer #hearted"],
            }),
            tg("hideCommentBadges", "Badges", "Odznaki", {
              hide: ["ytd-sponsor-comment-badge-renderer", "ytd-comment-renderer #sponsor-comment-badge", "ytd-author-comment-badge-renderer", "#author-comment-badge"],
            }),
            tg("hideCommentPinned", "“Pinned” label", "Etykieta „Przypięty”", {
              hide: ["ytd-pinned-comment-badge-renderer", "#pinned-comment-badge"],
            }),
            tg("hideCommentTime", "Comment time", "Czas komentarza", {
              hide: ["ytd-comment-renderer #published-time-text", "ytd-comment-view-model #published-time-text", "ytd-comment-replies-renderer #published-time-text"],
            }),
          ],
        },
      ],
    },

    {
      id: "look",
      icon: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
      title: T("Look", "Wygląd"),
      desc: T("Make YouTube less eye-catching.", "Spraw, by YouTube mniej przyciągał wzrok."),
      sections: [
        {
          title: T("Grayscale", "Skala szarości"),
          items: [
            tg("grayscaleThumbnails", "Thumbnails", "Miniatury", { css: under("&", THUMBS).join(",") + "{filter:grayscale(1)!important}" }),
            tg("grayscaleAvatars", "Channel avatars", "Awatary kanałów", { css: under("&", AVATARS).join(",") + "{filter:grayscale(1)!important}" }),
            tg("grayscalePlayer", "Video player", "Odtwarzacz", { css: "& video,& .html5-video-player video{filter:grayscale(1)!important}" }),
            tg("grayscalePage", "The whole page", "Cała strona", {
              hint: T("Everything, including the video", "Wszystko, razem z filmem"),
              css: "&{filter:grayscale(1)}",
            }),
          ],
        },
        {
          title: T("Thumbnails", "Miniatury"),
          items: [
            tg("blurThumbnails", "Blur thumbnails until hover", "Rozmyj miniatury do najechania", {
              hint: T("Judge a video by its title, not its cover", "Oceniaj film po tytule, nie po okładce"),
              css:
                under("&", THUMBS).join(",") + "{filter:blur(18px)!important;transition:filter .15s}" +
                under("&", THUMBS.map((s) => s.replace(/ img$/, ":hover img"))).join(",") + "{filter:none!important}" +
                under("html.ytc-grayscale-thumbnails.ytc-blur-thumbnails", THUMBS).join(",") + "{filter:grayscale(1) blur(18px)!important}" +
                under("html.ytc-grayscale-thumbnails.ytc-blur-thumbnails", THUMBS.map((s) => s.replace(/ img$/, ":hover img"))).join(",") + "{filter:grayscale(1)!important}",
            }),
            tg("hideThumbnails", "Make thumbnails invisible", "Ukryj miniatury (zostaw układ)", {
              css: under("&", THUMBS).join(",") + "{opacity:0!important}",
            }),
            tg("hideFeedAvatars", "Hide channel avatars in feeds", "Ukryj awatary kanałów w feedach", {
              hide: [
                "ytd-rich-item-renderer #avatar-container",
                "ytd-rich-item-renderer yt-decorated-avatar-view-model",
                "yt-lockup-view-model yt-decorated-avatar-view-model",
              ],
            }),
          ],
        },
      ],
    },
  ];

  /* -------------------------------------------------------------- flatten */

  const ITEMS = [];
  const ITEM_PANEL = {};
  for (const panel of PANELS) {
    for (const section of panel.sections) {
      const list = (section.master ? [section.master] : []).concat(section.items);
      for (const item of list) {
        ITEMS.push(item);
        ITEM_PANEL[item.key] = panel.id;
      }
    }
  }
  const BY_KEY = Object.fromEntries(ITEMS.map((i) => [i.key, i]));
  const TOGGLES = ITEMS.filter((i) => i.type === "toggle");

  const DEFAULTS = {};
  for (const item of ITEMS) DEFAULTS[item.key] = item.type === "toggle" ? item.def === true : item.def;

  const GROUPS = {};
  for (const panel of PANELS) {
    for (const section of panel.sections) {
      if (section.master) GROUPS[section.master.key] = section.items.map((i) => i.key);
    }
  }

  /* ----------------------------------------------------------------- CSS */

  function buildCss() {
    const out = [];
    for (const item of TOGGLES) {
      const prefix = "html." + cls(item.key);
      if (item.hide) out.push(item.hide.map((s) => prefix + " " + s).join(",\n") + "{display:none!important}");
      if (item.css) out.push(item.css.replace(/&/g, prefix));
    }
    return out.join("\n");
  }

  /* --------------------------------------------------------- UI strings */

  const UI = {
    subtitle: T("Make YouTube yours", "Dopasuj YouTube do siebie"),
    search: T("Search settings…", "Szukaj ustawień…"),
    noResults: T("Nothing matches “{q}”.", "Brak wyników dla „{q}”."),
    on: T("On", "Włączona"),
    paused: T("Paused", "Wstrzymana"),
    pausedNote: T("The extension is paused. YouTube looks the way it ships.", "Wtyczka jest wstrzymana. YouTube wygląda tak jak fabrycznie."),
    active: T("{n} active", "{n} aktywnych"),
    tools: T("Tools", "Narzędzia"),
    toolsDesc: T("Hidden elements and backup.", "Ukryte elementy i kopia ustawień."),
    applied: T("Applied", "Zastosowano"),
    picker: T("Hidden elements", "Ukryte elementy"),
    pickerHint: T("Remove anything on YouTube with a click.", "Usuń z YouTube dowolny element jednym kliknięciem."),
    pick: T("Pick an element on the page", "Wskaż element na stronie"),
    pickNeedTab: T("Switch to a YouTube tab first (reload it if it was already open).", "Przejdź najpierw na kartę YouTube (odśwież ją, jeśli była już otwarta)."),
    selectorPlaceholder: T("or type a CSS selector", "albo wpisz selektor CSS"),
    add: T("Add", "Dodaj"),
    remove: T("Remove", "Usuń"),
    badSelector: T("That is not a valid selector.", "To nie jest poprawny selektor."),
    noneHidden: T("Nothing hidden yet.", "Nic jeszcze nie ukryto."),
    backup: T("Backup", "Kopia ustawień"),
    backupHint: T("Copy this text to move your setup to another browser.", "Skopiuj ten tekst, by przenieść ustawienia do innej przeglądarki."),
    export: T("Export", "Eksportuj"),
    copy: T("Copy", "Kopiuj"),
    copied: T("Copied", "Skopiowano"),
    import: T("Import", "Importuj"),
    importPlaceholder: T("Paste a settings string here…", "Wklej tutaj ciąg ustawień…"),
    importDone: T("Imported {n} settings. Previous ones were replaced.", "Zaimportowano {n} ustawień. Poprzednie zostały zastąpione."),
    importBad: T("This text is not a valid settings string.", "Ten tekst nie jest poprawnym ciągiem ustawień."),
    language: T("Language", "Język"),
    langAuto: T("Automatic", "Automatyczny"),
    reset: T("Reset everything", "Przywróć wszystko"),
    resetConfirm: T("Reset all settings and hidden elements?", "Przywrócić wszystkie ustawienia i ukryte elementy?"),
    pickHint: T("Click the element to hide. Esc cancels.", "Kliknij element do ukrycia. Esc anuluje."),
    pickHide: T("Hide it", "Ukryj"),
    pickParent: T("Select parent", "Zaznacz nadrzędny"),
    pickCancel: T("Cancel", "Anuluj"),
    pickDone: T("Hidden. Undo it in the extension popup → Tools.", "Ukryto. Cofniesz to w oknie wtyczki → Narzędzia."),
  };

  function lang(pref) {
    if (LANG_CODES.includes(pref)) return pref;
    const nav = ((global.navigator && global.navigator.language) || "en").toLowerCase();
    const base = nav.split("-")[0];
    return LANG_CODES.includes(base) ? base : "en";
  }
  const tr = (obj, l) => (obj && (obj[l] != null ? obj[l] : obj.en)) || "";

  /* ---------------------------------------------------------- normalize */

  const MAX_CUSTOM = 200;

  function validSelector(s, doc) {
    if (typeof s !== "string") return false;
    const v = s.trim();
    if (!v || v.length > 400 || /[{};]/.test(v) || v.includes("/*")) return false;
    try {
      (doc || global.document).createDocumentFragment().querySelector(v);
      return true;
    } catch (e) {
      return false;
    }
  }

  function cleanCustom(list, doc) {
    if (!Array.isArray(list)) return [];
    const out = [];
    for (const raw of list) {
      if (typeof raw !== "string") continue;
      const v = raw.trim();
      if (out.includes(v) || !validSelector(v, doc)) continue;
      out.push(v);
      if (out.length >= MAX_CUSTOM) break;
    }
    return out;
  }

  function cleanValue(item, value) {
    if (item.type === "toggle") return typeof value === "boolean" ? value : item.def === true;
    const allowed = item.options.map((o) => o.v);
    return allowed.includes(value) ? value : item.def;
  }

  /** Always returns a complete, type-safe settings object. */
  function normalize(stored, doc) {
    const src = stored && typeof stored === "object" ? stored : {};
    const out = {};
    for (const item of ITEMS) out[item.key] = cleanValue(item, src[item.key]);
    out.customHide = cleanCustom(src.customHide, doc);
    out.enabled = src.enabled !== false;
    out.uiLang = ["auto", ...LANG_CODES].includes(src.uiLang) ? src.uiLang : "auto";
    return out;
  }

  /** Settings with every feature switched off (used while the extension is paused). */
  function allOff() {
    const out = {};
    for (const item of ITEMS) out[item.key] = item.type === "toggle" ? false : item.key === "columns" ? 0 : "home";
    out.customHide = [];
    out.enabled = false;
    out.uiLang = "auto";
    return out;
  }

  /* ------------------------------------------------------ import/export */

  const PREFIX = "YTC1.";

  function toBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin);
  }
  function fromBase64(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  }

  /** Compact string holding only what differs from the defaults. */
  function encode(settings) {
    const s = normalize(settings);
    const diff = {};
    for (const item of ITEMS) if (s[item.key] !== DEFAULTS[item.key]) diff[item.key] = s[item.key];
    if (s.customHide.length) diff.customHide = s.customHide;
    return PREFIX + toBase64(JSON.stringify(diff));
  }

  /** Returns {ok, settings, count} or {ok:false}. Unknown / invalid keys are ignored. */
  function decode(text, doc) {
    try {
      let t = String(text || "").replace(/\s+/g, "");
      if (t.startsWith(PREFIX)) t = t.slice(PREFIX.length);
      if (!t || t.length > 200000) return { ok: false };
      const data = JSON.parse(fromBase64(t));
      if (!data || typeof data !== "object" || Array.isArray(data)) return { ok: false };
      const picked = {};
      let count = 0;
      for (const item of ITEMS) {
        if (!Object.prototype.hasOwnProperty.call(data, item.key)) continue;
        const clean = cleanValue(item, data[item.key]);
        if (clean !== data[item.key]) continue;
        picked[item.key] = clean;
        count++;
      }
      if (Object.prototype.hasOwnProperty.call(data, "customHide")) {
        picked.customHide = cleanCustom(data.customHide, doc);
        count += picked.customHide.length;
      }
      return { ok: true, settings: picked, count };
    } catch (e) {
      return { ok: false };
    }
  }

  /* ------------------------------------------------------------ redirects */

  const REDIRECTS = {
    subscriptions: "/feed/subscriptions",
    history: "/feed/history",
    library: "/feed/library",
    watchLater: "/playlist?list=WL",
  };

  /** Where should this URL be sent instead? null = stay. */
  function redirectTarget(loc, s) {
    const path = loc.pathname || "/";
    if (s.redirectShorts) {
      const m = /^\/shorts\/([\w-]{5,})/.exec(path);
      if (m) return "/watch?v=" + m[1];
    }
    if (path === "/" && REDIRECTS[s.homeRedirect]) return REDIRECTS[s.homeRedirect];
    return null;
  }

  /* ------------------------------------------------- element picker helper */

  const SAFE_ID = /^[A-Za-z][\w-]{0,40}$/;
  const SAFE_CLASS = /^[A-Za-z][A-Za-z-]{2,30}$/;

  /** Builds a short CSS selector that matches exactly this element. */
  function selectorFor(el, doc) {
    const d = doc || el.ownerDocument;
    const parts = [];
    let node = el;
    while (node && node.nodeType === 1 && node !== d.documentElement) {
      const tag = node.tagName.toLowerCase();
      let part = tag;
      if (node.id && SAFE_ID.test(node.id) && !/\d{4,}/.test(node.id)) {
        part = "#" + node.id;
      } else {
        const classes = [...node.classList].filter((c) => SAFE_CLASS.test(c) && !c.startsWith("ytc-")).slice(0, 2);
        part = tag + classes.map((c) => "." + c).join("");
        const parent = node.parentElement;
        if (parent) {
          const same = [...parent.children].filter((c) => c.tagName === node.tagName);
          const sameClass = classes.length ? same.filter((c) => classes.every((k) => c.classList.contains(k))) : same;
          if (sameClass.length > 1) part += ":nth-of-type(" + (same.indexOf(node) + 1) + ")";
        }
      }
      parts.unshift(part);
      const sel = parts.join(" > ");
      let hits;
      try { hits = d.querySelectorAll(sel); } catch (e) { hits = []; }
      if (hits.length === 1 && hits[0] === el) return sel;
      if (part.startsWith("#")) break;
      node = node.parentElement;
    }
    return parts.join(" > ");
  }

  global.YTC = {
    PANELS, ITEMS, BY_KEY, TOGGLES, DEFAULTS, GROUPS, ITEM_PANEL, UI, LANGS, REDIRECTS,
    cls, kebab, buildCss, lang, tr, normalize, allOff, encode, decode,
    redirectTarget, validSelector, cleanCustom, selectorFor, MAX_CUSTOM,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = global.YTC;
})(typeof globalThis !== "undefined" ? globalThis : this);
