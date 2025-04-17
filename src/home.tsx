export const Home = ({onLoad}:{onLoad:(data:ArrayBuffer)=>void}) => {
    return <>
      <h1>scratch-tas</h1>
      <input type="file" accept=".sb3" onChange={(e)=>
        (e.target as HTMLInputElement).files?.[0].arrayBuffer().then(onLoad)
      }/>
    </>
}