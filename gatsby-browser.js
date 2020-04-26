

exports.onRouteUpdate = () => {
    document.querySelectorAll("figure a").forEach(function(e) {
        e.setAttribute('data-featherlight', 'image');
    })
}
