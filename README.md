# HappyEnd

### Group streams so that they end together

This helps in situations where you want to trigger an action only after a few different streams end.

Example:
```javascript
  import HappyEnd      from 'happy-end'
  import DevNullStream from 'dev-null-stream'
  import fs            from 'fs'
  
  let group = new HappyEnd()
  let streams = [ 
    fs.createReadStream(`${__dirname}/lib/sample1.txt`),
    fs.createReadStream(`${__dirname}/lib/sample2.txt`),
  ]
  streams.forEach((stream) => {
    stream.pipe(new DevNullStream())
  })  
  let finished = group.add(streams) // Each call to "add" returns the same promise
  finished.then((number) => {
    // Promise resolved, all streams have ended
    console.log(`Finished reading ${number} files`)
  }).catch((reason) => {
    // Promise rejected - at least one stream had an error
    console.error(`Failed to read all files because: ${reason}`)
  }) 
```


## Installation
```
npm install happy-end
```

## API

### group.add([streams]) / group.add(stream)
Accepts either a single stream or an array of streams to add to the group.
Returns a promise that resolves to the number of ended streams (see example above).


## Contributions / Issues
This project is still very new and has not been widely tested yet. Please feel free to open an issue or a PR if something's broken, or if you'd like some specific features added.

This was tested for readable, writable and transform streams (which were my use cases). If this doesn't work with your favorite stream, please open an issue or PR.

## License
MIT


