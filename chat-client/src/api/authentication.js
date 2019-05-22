import CONFIG from '../config'

export async function authenticate (email, password) {
  const url = CONFIG.authenticateEndpoint

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!response.ok) {
      throw new Error('failed to authenticate')
    }

    return true
  } catch (error) {
    console.log(error)
    return false
  }
}

export async function register (email, password) {
  try {
    const response = await fetch(CONFIG.registerEndpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!response.ok) {
      throw new Error('failed to authenticate')
    }

    return true
  } catch (error) {
    return false
  }
}
