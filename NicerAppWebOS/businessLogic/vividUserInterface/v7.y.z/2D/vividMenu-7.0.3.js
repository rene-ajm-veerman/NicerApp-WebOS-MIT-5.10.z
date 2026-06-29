class naVividMenu {
  constructor(menuElId = 'siteMenu', openBtnId = 'btnShowStartMenu') {
    let menu = document.getElementById(menuElId) ||
    document.getElementById('textFontFamily_container') ||
    document.querySelector('.vividMenu_vertical, .themeEditorComponent');
    if (!menu) return;

    if (menu.dataset.initialized) return;
    menu.dataset.initialized = 'true';

    let currentlyOpen = null;

    const closeAll = () => {
      menu.querySelectorAll('.submenu').forEach(sm => sm.style.display = 'none');
      currentlyOpen = null;
    };

    const prepareItems = () => {
      menu.querySelectorAll('li').forEach(li => {
        li.classList.add('menu-item');
        if (li.querySelector(':scope > ul')) li.classList.add('has-submenu');
        li.style.position = 'relative';
        li.style.height = 'auto';
        li.setAttribute('tabindex', '0'); // Keyboard support
      });
    };

    prepareItems();

    const baseZ = 999999999;
    menu.style.zIndex = baseZ;

    const initSubMenu = (item) => {
      if (item.dataset.initDone) return;
      item.dataset.initDone = 'true';

      const submenu = item.querySelector('ul');
      if (!submenu) return;

      submenu.style.position = 'fixed';
      submenu.style.overflow = 'visible';
      submenu.style.background = 'rgba(15, 15, 35, 0.55)';
      submenu.style.border = '2px solid rgba(100, 180, 255, 0.55)';
      submenu.style.borderRadius = '10px';
      submenu.style.boxShadow = '0 5px 15px rgba(0,0,0,0.7)';
      submenu.style.padding = '12px';
      submenu.style.minWidth = '240px';
      submenu.style.height = 'auto';
      submenu.style.maxHeight = '65vh';
      submenu.style.zIndex = baseZ + 1000;
      submenu.style.display = 'none';

      submenu.style.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
      submenu.style.gap = '8px 26px';

      const openSubmenu = () => {
        closeAll();
        submenu.style.display = 'grid';
        currentlyOpen = submenu;

        const rect1 = submenu.getBoundingClientRect();
        const rect2 = item.getBoundingClientRect();
        let left = rect2.right + 8;
        let top = rect2.top;

        if (left + 300 > window.innerWidth) left = rect2.left - 8;

        submenu.style.left = left + 'px';
        submenu.style.top = top + 'px';
        submenu.style.width = (window.innerWidth - $(submenu).offset().left - rect1.left - rect2.left - 50) + 'px';
      };

      const hideSubmenu = () => {
        submenu.style.display = 'none';
        if (currentlyOpen === submenu) currentlyOpen = null;
      };

        // Mouse
        item.addEventListener('mouseenter', openSubmenu);
        item.addEventListener('mouseleave', (e) => {
          if (!submenu.contains(e.relatedTarget)) hideSubmenu();
        });

          // Touch support
          item.addEventListener('click', (e) => {
            e.stopPropagation();
            if (submenu.style.display === 'grid') {
              hideSubmenu();
            } else {
              openSubmenu();
            }
          });

          submenu.addEventListener('mouseleave', hideSubmenu);

          // Keyboard support
          item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (submenu.style.display === 'grid') hideSubmenu();
              else openSubmenu();
            }
            if (e.key === 'Escape' && currentlyOpen) {
              closeAll();
            }
          });

          // Close on Escape globally
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeAll();
          });
    };

    const initAll = () => {
      prepareItems();
      menu.querySelectorAll('.has-submenu').forEach(initSubMenu);
    };

    initAll();
    new MutationObserver(initAll).observe(menu, { childList: true, subtree: true });

    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target)) closeAll();
    });

      console.log('naVividMenu: Touch + Keyboard support added');
  }
}

