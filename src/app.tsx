import { useState } from 'preact/hooks'
import { Home } from './home'
import { Vm } from './vm';

export function App() {
  const [file, setFile] = useState<ArrayBuffer>();
  return !file ? <Home onLoad={setFile}/> : <Vm data={file}/>
}
