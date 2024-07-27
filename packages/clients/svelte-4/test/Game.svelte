<script>
    // import Button from './Button.svelte'; <Button {score} />
    let score = 0;
    setInterval(() => {
	score = Math.random() * 100;
    }, 5000);
</script>

<div>
    <h1>Game</h1>
    Game - Score: {score.toFixed(2)}
</div>

