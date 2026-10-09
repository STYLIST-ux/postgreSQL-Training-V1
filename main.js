  const taskForm = document.getElementById("taskForm")
  const taskInput = document.getElementById("taskInput")
  const addTask = document.getElementById("addTask")
  const count = document.getElementById("count")
  const taskList = document.getElementById("taskList")
  const skele_cont = document.querySelector(".skele_cont")
  
  let isInitialLoad = true
  
  const client = supabase.createClient(
    "https://zopeeznsefyguleabwjz.supabase.co",
    "sb_publishable_Bb47KoygMV8a7cwSoGxiog_yghuYkJ8"
  )
  
  async function sendData(inputValue) {
    const { data, error }  = await client
    .from("tasks")
    .insert({
      task: inputValue,
      completed: false
    })
    
    console.log("data:", data)
    if (error) console.error("Error inserting data:", error)
  }
  
  
  taskForm.addEventListener("submit",async (e) => {
    e.preventDefault()
    
    if(taskInput.value === "") {
      alert("Add a Task")
      return
    }
    
    const inputValue = taskInput.value.trim()
    await sendData(inputValue)
    await render()
    
    taskInput.value = ""
  })
  
  async function getTasks() {
    const { data, error } = await client
    .from("tasks")
    .select("*")
    .order("id",{ascending: true})
    
    if (error) {
      console.error("Error fetching data:", error)
      return []
    }
    
    console.log("data:", data)
    return data || []
  }
  
  
  async function render() {
    
    if(isInitialLoad) {
      skele_cont.classList.add("act")
      addTask.disabled = true
    }
    
    const data = await getTasks()
    
    if(isInitialLoad) {
      skele_cont.classList.remove("act")
      addTask.disabled = false
      isInitialLoad = false
    }
    
    taskList.innerHTML = ""
    
    if(data.length === 0) {
      taskList.innerHTML = `<p class="empty">No task Here </p>`
      count.textContent = 0
      return
    }
    
    count.textContent = data.length
    
    taskList.innerHTML = data.map(task => {
      return (
        `
        <li class="task-item ${task.completed ? "completed" : ""}" data-id="${task.id}">
          <button class="complete-btn" aria-label="Complete task">
            <span></span>
          </button>
          
          <div class="task-content">
            <p>${task.task}</p>
            <small>${task.completed ? "completed" : "pending"}</small>
          </div>
          <button class="delete-btn" aria-label="Delete task">
            ×
          </button>
          
        </li>
        `
      )
    }).join("")
  }
  
  render()
  
  taskList.addEventListener("click",async (e) => {
    let data = await getTasks()
    
    const btn = e.target.closest("button")
    if(!btn) return;
    
    const id = Number(btn.closest("li").dataset.id)
    if(!id) return;
    
    if(btn.classList.contains("delete-btn")) {
      const { data, error } = await client
      .from("tasks")
      .delete()
      .eq("id", id)
      
      console.log("Delete error:", error)
      if (error) return
      await render()
    }
    
    if(btn.classList.contains("complete-btn")) {
      const tasks = await getTasks()
      const currentTask = tasks.find(task => task.id === id)
      
      if(!currentTask) return
      
      const { data, error } = await client
      .from("tasks")
      .update({
        "completed": !currentTask.completed
      })
      .eq("id",id)
      
      console.log("Delete error:", error)
      if (error) return
      
      await render()
    }
  })