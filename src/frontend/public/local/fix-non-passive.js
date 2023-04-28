jQuery.event.special.touchstart = {
    setup: function (_, ns, handle) {
        if (ns.includes("noPreventDefault")) {
            this.addEventListener("touchstart", handle, { passive: false });
        } else {
            this.addEventListener("touchstart", handle, { passive: true });
        }
    }
};
jQuery.event.special.touchmove = {
    setup: function (_, ns, handle) {
        if (ns.includes("noPreventDefault")) {
            this.addEventListener("touchmove", handle, { passive: false });
        } else {
            this.addEventListener("touchmove", handle, { passive: true });
        }
    }
};

jQuery.event.special.wheel = {
    setup: function (_, ns, handle) {
        this.addEventListener("wheel", handle, { passive: true });
    }
};

jQuery.event.special.scroll = {
    setup: function (_, ns, handle) {
        this.addEventListener("scroll-blocking", handle, { passive: true });
    }
};


jQuery.event.special.mousewheel = {
    setup: function (_, ns, handle) {
        this.addEventListener("mousewheel", handle, { passive: true });
    }
};

function radioBold(thisRadio) {
    //removendo classe radio-label de todos
    var labelradios = $(".radio-label");
    labelradios.map(function () {
        $(this).removeClass('radio-bold');
    })
    //adicionando classe radio-label somente ao item clicado
    var label = thisRadio.parentNode
    $(label).addClass('radio-bold');
}