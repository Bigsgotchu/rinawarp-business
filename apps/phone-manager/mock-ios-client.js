/**
 * WARNING: This is a MOCK implementation.
 * It simulates the behavior of a Node.js wrapper for libimobiledevice.
 * It will not connect to or control a physical iPhone.
 *
 * Replace these mock functions with calls to a real iOS library to support
 * physical devices. The exposed API mirrors the calls expected by main.js.
 */

const IOS_MOCK_DEVICE_ID = '00008030-001A793A2E8B002E'

// Mock filesystem definition
const mockFilesystem = {
  '/': [
    { name: 'Applications', isDirectory: true, isFile: false, size: 0 },
    { name: 'Documents', isDirectory: true, isFile: false, size: 0 },
    { name: 'private', isDirectory: true, isFile: false, size: 0 },
    { name: 'README.txt', isDirectory: false, isFile: true, size: 4096 }
  ],
  '/Documents': [
    { name: '..', isDirectory: true, isFile: false, size: 0 },
    { name: 'Photos.jpg', isDirectory: false, isFile: true, size: 1258291 },
    { name: 'Notes.pdf', isDirectory: false, isFile: true, size: 524288 }
  ]
}

const iosClient = {
  async listDevices () {
    return [
      {
        id: IOS_MOCK_DEVICE_ID,
        platform: 'ios',
        state: 'device',
        name: 'Mock iPhone 13 Pro'
      }
    ]
  },

  async readdir (deviceId, path) {
    if (deviceId !== IOS_MOCK_DEVICE_ID) {
      throw new Error('Mock device not found.')
    }

    const files = mockFilesystem[path] || []
    if (files.length === 0 && path !== '/') {
      throw new Error(`Path not found or empty in mock FS: ${path}`)
    }

    return files.map(file => ({
      ...file,
      path: path.endsWith('/') ? `${path}${file.name}` : `${path}/${file.name}`,
      size: file.size.toString(),
      mtime: Date.now()
    }))
  },

  async pull (deviceId, remotePath, localPath) {
    if (deviceId !== IOS_MOCK_DEVICE_ID) {
      throw new Error('Mock device not found.')
    }
    if (remotePath.endsWith('/')) {
      throw new Error('Cannot pull a directory on iOS.')
    }
    throw new Error(
      'File pull not implemented for the mock iOS client. Requires libimobiledevice.'
    )
  },

  async shell (deviceId, command) {
    if (deviceId !== IOS_MOCK_DEVICE_ID) {
      throw new Error('Mock device not found.')
    }

    if (command.includes('shutdown')) {
      console.log('Mock iOS: Executing shutdown command.')
      return { message: "Mock shutdown command executed. Device is now 'disconnected'." }
    }

    if (command.includes('input text')) {
      const text = command.substring(command.indexOf('"') + 1, command.lastIndexOf('"'))
      console.log(`Mock iOS: Sending input text: ${text}`)
      return { message: `Mock input text '${text}' sent.` }
    }

    throw new Error(`Unknown shell command in mock client: ${command}`)
  },

  async backup (deviceId, { destination, paths = [] }) {
    if (deviceId !== IOS_MOCK_DEVICE_ID) {
      throw new Error('Mock device not found.')
    }
    return {
      success: true,
      message: `Mock backup created at ${destination}`,
      processed: paths
    }
  },

  async restore (deviceId, { source }) {
    if (deviceId !== IOS_MOCK_DEVICE_ID) {
      throw new Error('Mock device not found.')
    }
    return { success: true, message: `Mock restore from ${source} completed.` }
  },

  async listPackages (deviceId) {
    if (deviceId !== IOS_MOCK_DEVICE_ID) {
      throw new Error('Mock device not found.')
    }
    return [
      { packageId: 'com.example.photos', name: 'Mock Photos', version: '1.2.3' },
      { packageId: 'com.example.music', name: 'Mock Music', version: '5.4.3' }
    ]
  },

  async listApplications (deviceId) {
    if (deviceId !== IOS_MOCK_DEVICE_ID) {
      throw new Error('Mock device not found.')
    }
    return [
      {
        CFBundleIdentifier: 'com.example.photos',
        CFBundleDisplayName: 'Mock Photos',
        CFBundleVersion: '1.2.3'
      },
      {
        CFBundleIdentifier: 'com.example.music',
        CFBundleDisplayName: 'Mock Music',
        CFBundleVersion: '5.4.3'
      }
    ]
  },

  async installApp (deviceId, packagePath) {
    if (deviceId !== IOS_MOCK_DEVICE_ID) {
      throw new Error('Mock device not found.')
    }
    return { success: true, message: `Mock install of ${packagePath} complete.` }
  },

  async uninstallApp (deviceId, packageName) {
    if (deviceId !== IOS_MOCK_DEVICE_ID) {
      throw new Error('Mock device not found.')
    }
    return { success: true, message: `Mock uninstall of ${packageName} complete.` }
  },

  async reboot (deviceId, mode) {
    if (deviceId !== IOS_MOCK_DEVICE_ID) {
      throw new Error('Mock device not found.')
    }
    return { success: true, message: `Mock iOS reboot triggered (${mode}).` }
  },

  async getBatteryInfo (deviceId) {
    if (deviceId !== IOS_MOCK_DEVICE_ID) {
      throw new Error('Mock device not found.')
    }
    return {
      status: 'charging',
      health: 'good',
      temperatureC: 32.5,
      level: 87
    }
  },

  async getSystemInfo (deviceId) {
    if (deviceId !== IOS_MOCK_DEVICE_ID) {
      throw new Error('Mock device not found.')
    }
    return {
      model: 'iPhone 13 Pro',
      osVersion: '17.0',
      buildId: '21A123',
      serial: deviceId
    }
  },

  async recoveryScan (deviceId, categories) {
    if (deviceId !== IOS_MOCK_DEVICE_ID) {
      throw new Error('Mock device not found.')
    }
    const now = Date.now()
    return categories.map(cat => ({
      category: cat,
      items: [
        {
          id: `${cat}-ios-1`,
          name: `Mock ${cat} item`,
          timestamp: now,
          preview: 'Sample preview'
        }
      ]
    }))
  },

  async startRecoveryScan (deviceId, dataType) {
    if (deviceId !== IOS_MOCK_DEVICE_ID) {
      throw new Error('Mock device not found.')
    }
    console.log(`Mock iOS: Initiating deep scan for ${dataType}.`)
    await new Promise(resolve => setTimeout(resolve, 5000))
    return { success: true, message: 'Mock scan complete.' }
  },

  async executePrivileged (deviceId, command) {
    if (deviceId !== IOS_MOCK_DEVICE_ID) {
      throw new Error('Mock device not found.')
    }
    console.log(`Mock iOS: Pretending to run privileged command: ${command}`)
    return { success: true, output: `iOS MOCK: Executed "${command}"` }
  },

  async runHealthDiagnostics (deviceId) {
    if (deviceId !== IOS_MOCK_DEVICE_ID) {
      throw new Error('Mock device not found.')
    }
    return {
      score: 90,
      battery: 'Mock battery capacity 92%, 32.5°C',
      storage: 'Mock storage usage 68%',
      thermal: 'Mock chassis temp 34°C',
      prediction: 'Mock iOS: Device health is excellent. No issues predicted.'
    }
  }
}

module.exports = iosClient
