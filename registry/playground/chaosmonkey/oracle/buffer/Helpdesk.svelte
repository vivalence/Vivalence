const {user,assistance} = $props;
let focus = $state(false); // some effect()
<div>
  if(!user && !focus) <Speechbubble text={assistant}/>
  else if(user) <Textarea reactive={user}/>
</div>
