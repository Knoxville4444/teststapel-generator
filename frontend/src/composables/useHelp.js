import { ref } from 'vue';

// Einfacher modulweiter Singleton-State (keine eigene Store nötig für ein Bool)
const showHelp = ref(false);

export function useHelp() {
  return { showHelp };
}
