<template>
  <div>
    <svg-icon icon-class="doc" @click="click" />
  </div>
</template>

<script>
export default {
  name: 'Doc',
  methods: {
    click() {
      window.open('https://course-realmicah.doc.coding.io', '_blank')
    }
  }
}
</script>
