module.exports = {
  async capitalize(s) {
        s = s.toLowerCase();
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
      }
  }