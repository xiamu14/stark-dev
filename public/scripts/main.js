const historyEvent = new Event("historyChange");

document.addEventListener("DOMContentLoaded", () => {
  const routes = document.querySelectorAll(".route");
  const draftContent = document.querySelector("#draftContent");
  initRouteStyle();
  routes.forEach((route) => {
    route.addEventListener("click", async () => {
      const path = route.dataset.path;
      console.log("xxxx");
      history.pushState({ path }, "", path);
      window.dispatchEvent(historyEvent);
      const content = await getContent(path);
      draftContent.innerHTML = content;
    });
  });

  window.addEventListener("historyChange", () => {
    const pathname = window.location.pathname;
    console.log("pathname", pathname);
    routes.forEach((route) => {
      route.classList.remove("route-active");
      route.classList.add("route-default");
    });
    const activeRoute = document.querySelector(`[data-path="${pathname}"]`);
    activeRoute.classList.add("route-active");
    activeRoute.classList.remove("route-default");
  });

  window.onpopstate = async (event) => {
    if (event.state) {
      window.dispatchEvent(historyEvent);
      const content = await getContent(event.state.path);
      draftContent.innerHTML = content;
    }
  };
});

async function getContent(path) {
  const res = await fetch(`/api${path}`);
  const result = await res.json();
  return result.content;
}

function initRouteStyle() {
  const pathname = window.location.pathname;
  const activeRoute = document.querySelector(`[data-path="${pathname}"]`);
  if (activeRoute) {
    activeRoute.classList.add("route-active");
    activeRoute.classList.remove("route-default");
  }
}
