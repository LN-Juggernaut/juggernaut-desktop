<img src="./resources/images/juggernaut_horizontal.png" width="100%" />
<br />

**Juggernaut** utilizes the Lightning Network to provide end-to-end encrypted, onion-routed, censorship resistanst, peer-to-peer messaging with native payment capabilities.

<br/>
<img src="./resources/images/screenshot.png" width="100%" />

## Requirements
* Have a Bitcoin + Lightning Node (LND 0.9.x or greater) fully synced.
* Have access to modify "lnd.conf" or execute LND
* Enable Keysend

  ### How to enable Keysend 
  On lnd.conf add this line:
  * accept-keysend=1

  Or run lnd with this argument:
  * --accept-keysend

  (Keysend is an experimental feature, don't be reckless)

## Maintainers

- [John Cantrell (@JohnCantrell97)](https://github.com/johncantrell97)

## License

MIT © [Juggernaut](https://github.com/LN-Juggernaut/juggernaut-desktop/LICENSE)
