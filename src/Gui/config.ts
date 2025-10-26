export default {
    controls: {
        label: 'Controls',
        border: { type: 'line' },
        bottom: 0,
        left: '50%',
        width: '50%',
        height: "25%",
        style: {
            fg: 'white',
            bg: 'transparent',
            border: {
                fg: '#f0f0f0',
                bg: "#181818"
            }
        }
    },
    queueBox: {
        border: { type: 'line' },
        top: 0,
        left: '50%',
        width: '50%',
        height: '50%',
        scrollable: true,
        label: 'Queue',
        style: {
            fg: 'white',
            bg: 'transparent',
            border: {
                fg: '#f0f0f0',
                bg: "#181818",
            }
        }
    },
    log: {
        label: 'Log',
        border: { type: 'line' },
        left: 0,
        width: '50%',
        height: "100%",
        style: {
            fg: 'white',
            bg: 'transparent',
            border: {
                fg: '#f0f0f0',
                bg: "#181818"
            }
        }
    },
    nowPlaying: {
        label: 'Now Playing',
        border: { type: 'line' },
        left: "50%",
        top: "50%",
        width: '50%',
        height: "25%",
        style: {
            fg: 'white',
            bg: 'transparent',
            border: {
                fg: '#f0f0f0',
                bg: "#181818"
            }
        }
    },
    progressBar: {
        top: 'center',
        left: 'center',
        width: '50%',
        height: 1,
        orientation: 'horizontal', // or 'vertical'
        style: {
            bg: 'grey', // Background color of the entire bar
            bar: {
                bg: 'blue', // Color of the filled portion of the bar
                fg: 'white' // Foreground color (e.g., for text if pch is used)
            }
        },
        pch: '█', // Character to fill the bar with (e.g., a solid block)
        filled: 0 // Initial fill percentage (0-100)
    }
}