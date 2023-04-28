const showLoading = function () {
  Swal.fire({
    title: 'Carregando...',
    width: 600,
    allowEscapeKey: false,
    allowOutsideClick: false,
    showConfirmButton: false,
    timer: 0,
    onOpen: () => {
      Swal.showLoading();
    }
  })
};

const hideLoading = function () {
  Swal.close()
};
