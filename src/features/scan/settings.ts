const key = "bgm_vision_model"

export function getSelectedModel() {
  return localStorage.getItem(key) || "auto"
}

export function setSelectedModel(value: string) {
  localStorage.setItem(key, value)
}
