// console.log("begin")
// fetch("http://colormind.io/list/").then((response)=>{
//     response.text().then((json)=>{
//         const data=JSON.parse(json)
//         console.log(data)
//         data.result.forEach((colorscheme)=>{
//             console.log(colorscheme)
//         })
//         console.log(data, typeof data)
//     })
// })
// console.log("end")

fetch("http://colormind.io/api/",{
   method:"POST",
   body:JSON.stringify({"model":"default"})
}).then((response)=>{
    response.text().then((json)=>{
        const data=JSON.parse(json)
        console.log(data)
        data.result.forEach((colorscheme)=>{
            console.log(colorscheme)
        })
        console.log(data, typeof data)
    })
})