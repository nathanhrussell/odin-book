export function FeedView({ posts = [], onLike, onOpen }) {
const page = document.createElement("main");
page.className = "mx-auto max-w-2xl px-4 pb-24 flex flex-col gap-4";


// Composer
const composer = document.createElement("section");
composer.className = "card card-pad flex gap-3";
composer.innerHTML = `
<img src="" alt="" class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" id="me-avatar"/>
<form id="composer" class="flex-1 flex flex-col gap-3">
<textarea class="textarea" id="content" placeholder="What’s happening?" maxlength="500"></textarea>
<div class="flex items-center justify-between">
<span class="text-xs text-gray-500">500 max</span>
<button class="btn btn-primary" type="submit">Post</button>
</div>
</form>
`;
page.appendChild(composer);


// Feed list
const list = document.createElement("section");
list.className = "flex flex-col gap-4";
posts.forEach((p) => list.appendChild(PostCard(p, { onLike, onOpen })));
page.appendChild(list);


return page;
}


export function PostCard(post, { onLike, onOpen }) {
const el = document.createElement("article");
el.className = "card card-pad flex flex-col gap-3";
el.innerHTML = `
<header class="flex items-center gap-3">
<img src="${post.author.avatar}" alt="${post.author.name}" class="w-10 h-10 rounded-full"/>
<div>
<div class="font-semibold">${post.author.name}</div>
<div class="text-xs text-gray-500">${new Date(post.createdAt).toLocaleString()}</div>
</div>
</header>
<p class="text-[15px] leading-6">${escapeHtml(post.content)}</p>
<footer class="flex items-center gap-3 text-sm">
<button class="btn btn-ghost" data-like>♡ <span>${post.likesCount}</span></button>
<button class="btn btn-ghost" data-open>💬 <span>${post.commentsCount}</span></button>
</footer>
`;


el.querySelector("[data-like]").addEventListener("click", () => onLike?.(post.id));
el.querySelector("[data-open]").addEventListener("click", () => onOpen?.(post.id));
return el;
}


function escapeHtml(str) {
return str
.replaceAll("&", "&amp;")
.replaceAll("<", "&lt;")
.replaceAll(">", "&gt;")
.replaceAll('"', "&quot;")
.replaceAll("'", "&#039;");
}