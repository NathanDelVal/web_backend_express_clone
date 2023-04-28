var mx;
$(document).on("mouseup", function () {
   mx= 0;
});

$(".drag").on({
  mousemove: function (e) {
    var mx2 = e.pageX - this.offsetLeft;
    if (mx) this.scrollLeft = this.sx + mx - mx2;
  },
  mousedown: function (e) {
    this.sx = this.scrollLeft;
    mx = e.pageX - this.offsetLeft;
  },
});

