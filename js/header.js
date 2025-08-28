document.addEventListener('DOMContentLoaded', function() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navCenter = document.querySelector('.nav-center');
    const body = document.body;
    
    // Mobile menu toggle functionality
    mobileToggle.addEventListener('click', function() {
        navCenter.classList.toggle('mobile-active');
        mobileToggle.classList.toggle('active');
        body.classList.toggle('menu-open');
    });
    
    // Mobile dropdown functionality for mega menu
    const allToolsLink = document.querySelector('.nav-center > li:has(.mega-menu) > a');
    const megaMenu = document.querySelector('.mega-menu');
    const parentLi = allToolsLink?.parentElement;
    
    if (allToolsLink && megaMenu && parentLi) {
        allToolsLink.addEventListener('click', function(e) {
            // Only prevent default and toggle on mobile
            if (window.innerWidth <= 768) {
                e.preventDefault();
                megaMenu.classList.toggle('mobile-menu-open');
                parentLi.classList.toggle('dropdown-open');
            }
        });
    }
    
    // Close mobile menu when clicking on regular nav links (not dropdown toggle)
    const navLinks = document.querySelectorAll('.nav-center a:not(.nav-center > li:has(.mega-menu) > a)');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navCenter.classList.remove('mobile-active');
                mobileToggle.classList.remove('active');
                body.classList.remove('menu-open');
                
                // Also close any open dropdowns
                if (megaMenu) {
                    megaMenu.classList.remove('mobile-menu-open');
                    parentLi?.classList.remove('dropdown-open');
                }
            }
        });
    });
    
    // Close menu when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && !e.target.closest('nav') && navCenter.classList.contains('mobile-active')) {
            navCenter.classList.remove('mobile-active');
            mobileToggle.classList.remove('active');
            body.classList.remove('menu-open');
            
            // Also close any open dropdowns
            if (megaMenu) {
                megaMenu.classList.remove('mobile-menu-open');
                parentLi?.classList.remove('dropdown-open');
            }
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // Reset mobile menu state on desktop
            navCenter.classList.remove('mobile-active');
            mobileToggle.classList.remove('active');
            body.classList.remove('menu-open');
            
            // Reset dropdown state
            if (megaMenu) {
                megaMenu.classList.remove('mobile-menu-open');
                parentLi?.classList.remove('dropdown-open');
            }
        }
    });
    
    // Handle mega menu items click on mobile
    const megaMenuLinks = document.querySelectorAll('.mega-menu a');
    megaMenuLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                // Close the entire mobile menu when a mega menu item is clicked
                navCenter.classList.remove('mobile-active');
                mobileToggle.classList.remove('active');
                body.classList.remove('menu-open');
                
                if (megaMenu) {
                    megaMenu.classList.remove('mobile-menu-open');
                    parentLi?.classList.remove('dropdown-open');
                }
            }
        });
    });

    // Scroll effect for header
    const header = document.querySelector('header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) { // Change after scrolling 50px
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}); 