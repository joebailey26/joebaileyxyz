<template>
  <div>
    <div ref="widget" />
    <p v-if="error" role="status">
      {{ error }}
      <button v-if="siteKey" class="btn" type="button" @click="retry">
        Retry spam check
      </button>
    </p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  siteKey?: string
}>(), {
  siteKey: ''
})

const emit = defineEmits<{
  token: [token: string]
}>()

const widgetElement = useTemplateRef<HTMLElement>('widget')
const { error, renderWidget, reset, retry, dispose } = useTurnstileWidget({
  siteKey: () => props.siteKey,
  container: widgetElement,
  onToken: (token) => emit('token', token)
})

onMounted(renderWidget)
onBeforeUnmount(dispose)

// The contact form resets the widget after each attempt, as tokens are single-use.
defineExpose({ reset })
</script>
