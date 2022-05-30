let bodyOnClickListener: (e: any) => void;
const SlidePanelClose = {
  bodyClick: (callback: () => void) => {
    SlidePanelClose.removeBodyClick();
    bodyOnClickListener = e => {
      const dom = document.getElementById('SlidePanel');
      if (dom && e.target !== dom && !dom.contains(e.target)) {
        callback && callback();
      }
    };
    document.getElementById('app')!.addEventListener('click', bodyOnClickListener);
  },

  removeBodyClick: () => {
    if (bodyOnClickListener) {
      document.getElementById('app')!.removeEventListener('click', bodyOnClickListener);
    }
  },
};

export default SlidePanelClose;
