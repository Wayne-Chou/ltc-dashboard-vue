<script setup>
defineProps({
  isCollapsed: {
    type: Boolean,
    default: false,
  },
  logoSrc: {
    type: String,
    required: true,
  },
  regionLabel: {
    type: String,
    required: true,
  },
  regionOptions: {
    type: Array,
    required: true,
  },
  isKioskView: {
    type: Boolean,
    default: false,
  },
  navItems: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits([
  'toggle-sidebar',
  'select-region',
  'toggle-kiosk',
  'logout',
])

const SECTION_SCROLL_OFFSET = 60

function scrollToSection(href) {
  const id = href.startsWith('#') ? href.slice(1) : href
  if (!id) return

  const el = document.getElementById(id)
  if (!el) return

  const scrollContainer = document.querySelector('.main-content')
  if (scrollContainer) {
    const containerTop = scrollContainer.getBoundingClientRect().top
    const elementTop = el.getBoundingClientRect().top
    const nextScrollTop =
      scrollContainer.scrollTop +
      (elementTop - containerTop) -
      SECTION_SCROLL_OFFSET

    scrollContainer.scrollTo({
      top: Math.max(0, nextScrollTop),
      behavior: 'smooth',
    })
    return
  }

  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <aside id="mySidebar" class="sidebar" :class="{ collapsed: isCollapsed }">
    <button
      id="sidebarToggle"
      type="button"
      class="btn btn-primary shadow-sm"
      @click="emit('toggle-sidebar')"
    >
      <i
        class="bi bi-chevron-left"
        :class="{ 'rotate-180': isCollapsed }"
      />
    </button>

    <div class="sidebar-inner-content">
      <div class="text-center mt-3 mb-2">
        <img
          style="max-width: 150px; height: auto"
          :src="logoSrc"
          alt="logo"
        />
      </div>

      <header class="custom-header mt-4 mb-4">
        <div
          class="dashboard-header-toolbar mt-3"
          style="display: flex; flex-direction: column; gap: 8px"
        >
          <div class="header-region dropdown w-100">
            <button
              class="btn btn-primary dropdown-toggle w-100"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {{ regionLabel }}
            </button>
            <ul class="dropdown-menu w-100">
              <li v-for="option in regionOptions" :key="option.value">
                <a
                  class="dropdown-item"
                  href="#"
                  @click.prevent="emit('select-region', option.value)"
                >
                  {{ option.label }}
                </a>
              </li>
            </ul>
          </div>
          <div class="header-actions w-100">
            <button
              class="btn btn-primary w-100"
              type="button"
              @click="emit('toggle-kiosk')"
            >
              {{ isKioskView ? '切回一般模式' : '一體機公告' }}
            </button>
          </div>
          <div class="header-actions w-100">
            <button
              class="btn btn-primary w-100"
              type="button"
              @click="emit('logout')"
            >
              登出
            </button>
          </div>
        </div>
      </header>

      <nav
        class="navbar navbar-expand-lg bg-white shadow-sm sticky-top border-bottom"
      >
        <div class="container-fluid">
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#walkingNavbar"
          >
            <span class="navbar-toggler-icon" />
          </button>
          <div id="walkingNavbar" class="collapse navbar-collapse">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li
                v-for="item in navItems"
                :key="item.href"
                class="nav-item"
              >
                <a
                  class="nav-link fw-bold text-dark"
                  :href="item.href"
                  @click.prevent="scrollToSection(item.href)"
                >
                  {{ item.label }}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  </aside>
</template>
