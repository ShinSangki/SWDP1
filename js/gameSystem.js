//게임 전체에서 사용될 덱 저장

const gameDeck = [ ];//[ 패의 점수, 특수패(광, 열끗)여부, 이미지 경로 ]
//1-1광, 3-1광, 4-1열끗, 7-1열끗, 8-1광, 9-1열끗.
for(let i = 1; i < 10; i++){
    gameDeck.push({score: i, isSpecial: true, img: "multiMedia/" + i + "_1.jpg"});
    gameDeck .push({score: i, isSpecial: false, img: "multiMedia/" + i + "_2.jpg"});
};
const defaultChip = 10; //기본적으로 배팅될 칩의 수, 불변값

let player = {
    name: "player", //구분용 이름
    chip: 1000, //플레이어가 소지한 칩, 초기치 1000개
    card: [], //라운드마다 플레이어가 소지할 카드
    selectCard: [0, 1]
};

let computer1 = {
    name: "computer1", //구분용 이름
    chip: 1000, //컴퓨터가 소지한 칩, 초기치 1000개
    card: [] //라운드마다 컴퓨터가 소지할 카드
};

let computer2 = {
    name: "computer2", //구분용 이름
    chip: 1000, //컴퓨터가 소지한 칩, 초기치 1000개
    card: [] //라운드마다 컴퓨터가 소지할 카드
};

let round = {
    deck: gameDeck, //라운드마다 초기화되는 덱, startRound() 함수에서 시작마다 gameDeck 변수가 할당됨.
    bettingChip: 0, //현재 배팅된 칩, 라운드 승자의 칩을 수치만큼 가산 후 초기화
    nowChip: defaultChip, //배팅해야할 칩의 수
    alive: [player.name, computer1.name, computer2.name], // 현재 살아있는 유저, 1이 되면 종료
    callUser: [], //콜을 외친 유저 
    round: 0,
    bettingTurn: null
}

const userList = [ player, computer1, computer2 ] //유저리스트, 불변값

function startRound(reRound = false){
    if (player.chip <= 0){
        resetGame();
        return
    }
    if (reRound === true){
        roundReset(true); //사구파토 라운드
    }
    else{
        roundReset(); //라운드 요소 리셋
    }

    changeColor(0)
    changeColor(1)
    changeColor(2)
    defaultBetting(player); // 플레이어 기본 배팅
    defaultBetting(computer1); // 컴퓨터 기본 배팅
    defaultBetting(computer2); // 컴퓨터 기본 배팅

    docBettingChip() //표기변경
    docUserChip() //표기변경

    for(let i = 0; i<2; i++){ // 모든 유저의 카드뽑기 2회 진행.
        for (let j = 0; j < userList.length; j++){ //유저 검색
            if (round.alive.includes(userList[j].name)){ //검색된 유저가 살아있을 경우
                getCard(userList[j]) //카드 뽑기
            }
        }
    }

    openCard(player, 0);
    openCard(player, 1);
    openCard(computer1, 0); // 컴퓨터1의 첫번째 카드 공개
    openCard(computer2, 0); // 컴퓨터2의 첫번째 카드 공개

    let rand = Math.floor(Math.random() * 3); //시작할 유저를 랜덤으로 정함

    if (rand === 0){
        if (round.alive.includes(player.name)){
            round.bettingTurn = userList[0] // 플레이어 시작
        }
        else{
            if (round.alive.includes(userList[rand + 1])){
                round.bettingTurn = userList[1];
            }
            else {
                round.bettingTurn = userList[2];
            }
                
            setTimeout(computerBetting, 1000);
        }
    }
    else {
        if (round.alive.includes(userList[rand].name)){
            round.bettingTurn = userList[rand] //컴퓨터 시작
            setTimeout(computerBetting, 1000);
        }
        else {
            switch(rand){
            case 1:
                round.bettingTurn = userList[2];
                break;
            case 2:
                round.bettingTurn = userList[1];
                break;
            }  
            setTimeout(computerBetting, 1000);
        }
        
    }
    showCurrentTurn();
}

//라운드 초기화
function roundReset(reRound = false, reGame = false){
    round.deck = [...gameDeck]; //라운드에서 사용할 덱 초기화
    if (reRound === false){
        round.bettingChip = 0; //현재 배팅된 칩을 0개로 초기화
    }
    round.nowChip = defaultChip; //배팅해야할 칩을 defaultChip 개로 초기화

    if (reRound === false){
        round.alive = []; //생존 유저 목록 초기화
        if (reGame === true){
            for (let i = 0; i < userList.length; i++){
                round.alive.push(userList[i].name)
            }
        }
        else {
            for (let i = 0; i < userList.length; i++){
                if (userList[i].chip > 0){ //칩이 있는 유저만 추가
                    round.alive.push(userList[i].name)
                }
            }
        }
    }

    round.callUser = []; //콜을 외친 유저 목록 초기화
    round.round = 0; //첫배팅, 두번째 배팅인지 체크하는 항목

    player.card = []; // 플레이어 카드 초기화
    computer1.card = []; //컴퓨터 카드 초기화
    computer2.card = []; //컴퓨터 카드 초기화

    closeCard(); //카드 비공개
    docBettingChip() //표기변경
    docUserChip() //표기 변경
    docNowChip(); //표기변경
}

//모든 카드를 뒷면으로 설정
function closeCard(){
    document.getElementById("playerCard1").src = "multiMedia/0_0뒷면.jpg";
    document.getElementById("playerCard2").src = "multiMedia/0_0뒷면.jpg";
    document.getElementById("playerCard3").src = "multiMedia/0_0뒷면.jpg";
    document.getElementById("computer1_Card1").src = "multiMedia/0_0뒷면.jpg";
    document.getElementById("computer1_Card2").src = "multiMedia/0_0뒷면.jpg";
    document.getElementById("computer1_Card3").src = "multiMedia/0_0뒷면.jpg";
    document.getElementById("computer2_Card1").src = "multiMedia/0_0뒷면.jpg";
    document.getElementById("computer2_Card2").src = "multiMedia/0_0뒷면.jpg";
    document.getElementById("computer2_Card3").src = "multiMedia/0_0뒷면.jpg";
    
    document.getElementById("CardComb_1_1").src = "multiMedia/0_0뒷면.jpg"
    document.getElementById("CardComb_1_2").src = "multiMedia/0_0뒷면.jpg"
    document.getElementById("CardComb_2_1").src = "multiMedia/0_0뒷면.jpg"
    document.getElementById("CardComb_2_2").src = "multiMedia/0_0뒷면.jpg"
    document.getElementById("CardComb_3_1").src = "multiMedia/0_0뒷면.jpg"
    document.getElementById("CardComb_3_2").src = "multiMedia/0_0뒷면.jpg"
}

//카드 오픈 코드 통일. 전채 공개 또한 넣어서.
const openCard = (user, num, all)=>{
    if (all === true){
        for(let i = 0; i < Math.min(computer1.card.length, computer2.card.length, player.card.length); i++){
            if (round.alive.includes(computer1.name)){
                document.getElementById("computer1_Card" + (i+1)).src = computer1.card[i].img;
            }
            if (round.alive.includes(computer2.name)){
                document.getElementById("computer2_Card" + (i+1)).src = computer2.card[i].img;
            }
            if (round.alive.includes(player.name)){
                document.getElementById("playerCard" + (i+1)).src = player.card[i].img;
            }
        }
        return;
    }
    if (user === computer1 && round.alive.includes(computer1.name)){
        document.getElementById("computer1_Card" + (num + 1)).src = user.card[num].img;
    }
    if (user === computer2 && round.alive.includes(computer2.name)){
        document.getElementById("computer2_Card" + (num + 1)).src = user.card[num].img;
    }
    if (user === player && round.alive.includes(player.name)){
        document.getElementById("playerCard" + (num + 1)).src = user.card[num].img;
    }
}

// 카드 뽑기
function getCard(user){
    if (!round.alive.includes(user.name)){
        user.card.push({score: 0, isSpecial: false, img: "multiMedia/0_0뒷면.jpg"});
        return;
    }
    let randomNum = Math.floor(Math.random() * round.deck.length) // 0 ~ ( roundDeck의 길이 - 1 ) 에 해당하는 값 랜덤 지정, 카드를 뽑기 위함
    
    user.card.push(round.deck[randomNum]); //카드추가
    round.deck.splice(randomNum, 1); //roundDeck에서 카드 삭제 
}

//기본 배팅
function defaultBetting(user){
    if (user === player && user.chip < 0) { //칩이 없으면 패배
        winOrLose("패배"); //게임 패배
        return;
    }
    if (user === player && round.alive.length === 1 && round.alive.includes(user.name)){ //유일한 생존자가 플레이어라면
        winOrLose("승리"); //게임 승리
        return;
    }
    if (user.chip < defaultChip){ //칩이 defaultChip개 미만이라면 칩을 전부 배팅
        round.bettingChip = round.bettingChip + user.chip;  // 올인
        user.chip = 0; //유저의 칩 0개
        round.callUser.push(user.name) //콜한 유저 목록에 추가
        return;
    }
    round.bettingChip = round.bettingChip + defaultChip;
    user.chip = user.chip - defaultChip;
} 

//컴퓨터의 배팅
function computerBetting(){
    let user = round.bettingTurn;

    if (!round.alive.includes(user.name) || user.chip <= 0){ //현재 배팅 차례인 유저가 다이했거나 칩이 0개 이하
        callBetting(user)
        return;
    }

    switch(user.name) { // bettingType 제거 후 ~Judg 내부로 옮김
    case "computer1":
        attackBotJudg(user);
        return;
    case "computer2":
        defenseBotJudg(user);
        return;
    }
}

//배팅할 차례 변경
function changeTurn() {
    for (let i = 0; i < 2; i++){
        if (userList.indexOf(round.bettingTurn) < 2){
            round.bettingTurn = userList[userList.indexOf(round.bettingTurn) + 1];
        }
        else{
            round.bettingTurn = userList[0];
        }
        if (round.alive.includes(round.bettingTurn.name)){
            break;
        }
    }
    console.log(round.bettingTurn.name)
    showCurrentTurn();

    if (round.bettingTurn !== player){ //플레이어의 턴이 아니라면
        setTimeout(computerBetting, 1000); //1초 후 컴퓨터가 배팅
    }
}

//배팅 후 배경색 변경 
function changeColor(n, color) {
    if (n === 0) n = n + 2
    else n = n - 1
    const box = document.getElementsByClassName("profile-box");
    if (color === "red") box[n].style.backgroundColor = '#F05650';
    else if (color === "blue") box[n].style.backgroundColor = '#14D3FF';
    else if (color === "yellow") box[n].style.backgroundColor = '#F4D980';
    else box[n].style.backgroundColor = '#FFFFFF';
}

//배팅이 끝난 상황에서 판별 ( 추가카드 후 배팅 or 라운드 종료 )
function endBetting() {
    let temp = 0;
    for (let i = 0; i < userList.length; i++){
        if (round.alive.includes(userList[i].name) && userList[i].chip <= 0){
            temp++;
        }
    }
    if (temp === round.alive.length){
        endRound(); //라운드 종료
        return;
    }

    if (round.round === 0){ //3번째 카드를 받지 않은 상황이라면
        for (let i = 0; i < 3; i++){
            if (round.alive.includes(userList[i].name)) {
                changeColor(i)
            }
        }
        round.round++; //3번쨰 카드를 받은 상황으로 변수 설정
        round.callUser = []; //콜한 유저 초기화
        getCard(player); //3번째 카드 지급
        getCard(computer1); //3번째 카드 지급
        getCard(computer2); //3번째 카드 지급
        setTimeout(openCard(player, 2), 500); //플레이어의 카드 오픈
        
        changeTurn(); //턴 변경
        return;
    }
    else { // 3번째 카드를 받은 상황
        endRound(); //라운드 종료
        return;
    }
}

//다이 배팅
function dieBetting(user){
    if (round.bettingTurn === null){ //배팅할 턴이 아니라면 강제종료.
        return
    }
    if (user.name ==="player" && round.bettingTurn !== player){ //배팅할 턴이 아니라면 강제종료.
        alert("당신의 턴이 아닙니다!");
        return;
    }

    let index = round.alive.indexOf(user.name); //생존자 목록에서 다이 배팅을 한 유저 검색

    if (index !== -1){ //오류 방지
        round.alive.splice(index, 1); //생존자 목록에서 다이 배팅을 한 유저 삭제
    }

    changeColor(userList.indexOf(user),"red")
    if (round.alive.length === 1){ //생존자가 1명이라면
        endRound(); //라운드 종료 후 결산
        return;
    }

    if (round.alive.length === round.callUser.length){ //생존한 유저와 콜한 유저의 수가 동일 -> 배팅종료 
        endBetting(); //endBetting()으로 첫배팅이 끝인지 두번째 배팅이 끝인지 확인
        return;
    }

    changeTurn(); //턴 변경
    return;
}

//콜 배팅
function callBetting(user){
    if (round.bettingTurn === null){ //배팅할 턴이 아니라면 강제종료.
        return
    }
    if (user.name ==="player" && round.bettingTurn !== player){ //배팅할 턴이 아니라면 강제종료.
        alert("당신의 턴이 아닙니다!");
        return;
    }

    changeColor(userList.indexOf(user),"blue")
    if (user.chip <= 0){ //칩이 0개 이하라면
        if (round.alive.includes(user.name)){ //유저가 생존했는지 확인
            if (!round.callUser.includes(user.name)){ //유저가 이미 콜을 했다면 강제종료.
                round.callUser.push(user.name) // 칩이 0개 이하 + 생존 ->> 올인한 유저. 3번째 카드를 받는 과정에서 콜 유저 목록에서 빠져나감 or 올인 상태.
                if (round.alive.length === round.callUser.length){ //생존한 유저와 콜한 유저의 수가 동일 -> 배팅종료 
                    endBetting(); //endBetting()으로 첫배팅이 끝인지 두번째 배팅이 끝인지 확인
                    return;
                }
            }
        }
        changeTurn(); //턴 변경
        return; //칩이 0개라면 넘어감
    }
    if (user.chip >= round.nowChip){ //유저의 칩이 배팅요구치보다 많으면
        user.chip = user.chip - round.nowChip; //요구치만큼 유저의 칩 감소
        round.bettingChip = round.bettingChip + round.nowChip; //전체 배팅 칩을 배팅요구치만큼 증가
    }
    else{
        round.bettingChip = round.bettingChip + user.chip; //전체 배팅 칩을 유저의 칩만큼 증가
        user.chip = 0; //올인이므로 유저의 칩을 0개로 만듦
    }
    round.callUser.push(user.name); //콜 배팅을 한 사람 목록에 유저 추가
    docBettingChip(); //표기변경
    docUserChip(); // 표기변경


    if (round.alive.length === round.callUser.length){ //생존한 유저와 콜한 유저의 수가 동일 -> 배팅종료 
        endBetting(); //endBetting()으로 첫배팅이 끝인지 두번째 배팅이 끝인지 확인
        return;
    }

    changeTurn(); //턴 변경
    return;
}


//하프 배팅
function halfBetting(user){
    if (round.bettingTurn === null){ //배팅할 턴이 아니라면 강제종료.
        return
    }
    if (user.name ==="player" && round.bettingTurn !== player){ //배팅할 턴이 아니라면 강제종료.
        alert("당신의 턴이 아닙니다!");
        return;
    }
    if (round.callUser.length - 1 === round.alive.length) {
        callBetting(user)
        return
    }
    
    if (user.chip >= Math.floor(round.nowChip * 1.5)){ //유저의 칩이 배팅요구치의 1.5배보다 많으면
        round.nowChip = Math.floor(round.nowChip * 1.5); //요구치를 1.5배로 설정하고
        user.chip = user.chip - round.nowChip; //요구치만큼 유저의 칩 감소
        round.bettingChip = round.bettingChip + round.nowChip; //요구치만큼 전체 배팅 칩 증가
        round.callUser = [user.name]; //콜 배팅한 사람 목록을 유저명으로 할당

        docBettingChip(); //표기 변경
        docNowChip(); //표기 변경
        docUserChip(); //표기 변경

        for (let i = 0; i < 3; i++){
            if (round.alive.includes(userList[i].name)){
                changeColor(i)
            }
        }
        changeColor(userList.indexOf(user),"yellow")
        
    }
    else if (user.chip < Math.floor(round.nowChip * 1.5)){ //유저의 칩이 요구치의 1.5배만큼 없다면
        callBetting(user); //강제로 콜 배팅으로 넘어감.
        return;
    }

    changeTurn(); //턴 변경
    return;
}

function getPlayerCard() {
    return new Promise((resolve) => { //입력을 받으면 return
        const choices = document.querySelectorAll('.choice'); //choice클래스가 있는 태그들을 선택
        let clicked = false; 

        const handler = (event) => { //클릭을 했을때
            if (clicked) return;
            clicked = true; 
            const value = Number(event.currentTarget.getAttribute('data-value')); //data-value를 value 값으로 설정
            choices.forEach(div => div.removeEventListener('click', handler)); //클릭방지
            resolve(value); //value 값을 return 해줌
        };

        choices.forEach(div => div.addEventListener('click', handler)); //클릭 가능

        setTimeout(() => {
            if (!clicked) {
                choices.forEach(div => div.removeEventListener('click', handler)); //클릭방지
                console.log('입력 시간이 종료되었습니다.');
                resolve(null); // 아무 값도 입력하지 않으면 null 반환
            }
        }, 5000); //5초동안 대기
    });
}

//라운드 종료 시 칩 분배 등의 결과를 정산하는 코드
async function endRound(){
    round.bettingTurn = null; //배팅할 유저 초기화
    docCardComb()
    let winner
    if (round.alive.includes(player.name) && round.alive.length > 1){
        alert("카드를 선택하세요.\n 5초 안에 선택하지 않으면 가장 점수가 높은 패로 자동 선택됩니다.")
        const selection = await getPlayerCard();
        //클릭한 경우
        if (selection === 1) player.selectCard = [0, 1];
        else if (selection === 2) player.selectCard [1, 2];
        else if (selection === 3) player.selectCard [0, 2];
        else {
            //선택하지 않은 경우
            const scores = [
                getCardScore(player.card[0], player.card[1]),
                getCardScore(player.card[1], player.card[2]),
                getCardScore(player.card[0], player.card[2]),
            ];
            const idx = scores.indexOf(Math.max(...scores));
            if (idx === 0) player.selectCard = [0, 1];
            else if (idx === 1) player.selectCard = [1, 2];
            else if (idx === 2) player.selectCard = [0, 2];
        }
        winner = getWinners(); //변수 선언 << 승자가 누구인지 판단하는 변수
    }
    else {
        winner = getWinners();
    }

    if (winner === null && round.alive.length > 1){
        startRound(true);
        alert("구사파토!")
        return;
    }
    openCard(player, 0, true); // 카드 전체 오픈
    if (winner.length === 1){
        winner[0].chip = winner[0].chip + round.bettingChip; //승자에게 칩 가산
    }
    else {
        for (let i = 0; i < winner.length; i++){ //칩 균등하게 분배
            winner[i].chip = winner[i].chip + parseInt(round.bettingChip/winner.length)
        }
        round.bettingChip = round.bettingChip % winner.length //분배한 칩은 제외
        if (round.bettingChip > 0){ //남은 칩이 있다면
            while(round.bettingChip < 0){ //칩이 0이 될때까지 랜덤으로 분배
                let rand = Math.floor(Math.random()*3)
                winner[rand] = winner[rand] + 1;
                round.bettingChip = round.bettingChip - 1;
                if (round.bettingChip <= 0){
                    break;
                }
            }
        }
    }
    

    round.bettingChip = 0; //판에 배팅된 칩 초기화
    docBettingChip() //표기변경

    round.nowChip = defaultChip; //배팅해야하는 칩 수 초기화 
    docNowChip() //표기 변경

    docUserChip() //표기 변경

    if (player.chip <= 0) {
        setTimeout(winOrLose("패배"), 1000)
        return;
    }
    else if (computer1.chip <= 0 && computer2.chip <= 0) {
        setTimeout(winOrLose("승리"), 1000)
        return;
    }

}

//게임 전체를 리셋
function resetGame() {
    roundReset(false, true);

    player.chip = 1000
    player.card = []
    player.selectCard = [0, 1]
    
    computer1.chip = 1000
    computer1.card = []

    computer2.chip = 1000
    computer2.card = []

    round.bettingTurn = "unknown"
    round.nowChip = 0;
    closeCard();
    docBettingChip();
    docNowChip();
    docUserChip();
}

//게임 최종 출력
const winOrLose = (value)=>{
    alert(value + "하였습니다.");
    let tf = confirm("게임을 다시 시작하시겠습니까?")
    if (tf === true) {
        resetGame();
    }
}

//배팅된 칩이 몇 개인지 변경시킴 ( html )
function docBettingChip() {
    document.getElementById("bettingChip").innerHTML = '<img id="chip-img" src="image/칩.png" alt="응애요">배팅된 칩: ' + round.bettingChip; //표기 변경
}

//배팅요구치가 몇 개 인지 변경시킴 ( html )
function docNowChip() {
    document.getElementById("nowChip").innerHTML = '<img id="chip-img" src="image/칩.png" alt="응애요">배팅요구치: ' + round.nowChip; // 표기 변경
}

function docCardComb() {
    document.getElementById("CardComb_1_1").src = player.card[0].img
    document.getElementById("CardComb_1_2").src = player.card[1].img

    if (player.card.length > 2) {
        document.getElementById("CardComb_2_1").src = player.card[1].img
        document.getElementById("CardComb_2_2").src = player.card[2].img
        document.getElementById("CardComb_3_1").src = player.card[0].img
        document.getElementById("CardComb_3_2").src = player.card[2].img
    }
}


//유저들의 칩 갯수 현황 변경 ( html )
function docUserChip() {
    document.getElementById("computer1_Chip").innerHTML = '<img id="chip-img" src="image/칩.png" alt="응애요">컴퓨터1 칩 잔량: ' + computer1.chip;
    document.getElementById("computer2_Chip").innerHTML = '<img id="chip-img" src="image/칩.png" alt="응애요">컴퓨터2 칩 잔량: ' + computer2.chip;
    document.getElementById("playerChip").innerHTML = '<img id="chip-img" src="image/칩.png" alt="응애요">플레이어 칩 잔량: ' + player.chip;
}

//누구의 턴인지 가시화 ( html )
function showCurrentTurn() {
    document.getElementById("currentTurn").innerHTML = '<img id="chip-img" src="image/현재 턴.png" alt="응애요">현재 턴: <div class="top-box-ui">' + round.bettingTurn.name + '</div>'; // 표기 변경
}

function getScore() {
    let temp = [] //더미변수

    temp.push(round.alive.includes(player.name) ? getCardScore(player.card[player.selectCard[0]], player.card[player.selectCard[1]]) : -1)
    temp.push(round.alive.includes(computer1.name) ? getComputerScore(computer1) : -1) //컴퓨터의 점수 추가
    temp.push(round.alive.includes(computer2.name) ? getComputerScore(computer2) : -1) //컴퓨터의 점수 추가

    return temp
}

//승자를 구하는 함수
function getWinners(){
    let score = getScore();

    let maxScore = Math.max(...score); //최댓값 구하기

    if (score.includes(1500)){ //암행어사가 있고
        if (maxScore === 2038){ //13광땡, 18광땡이 있다면
            score[score.indexOf(1500)] = 3837 //암행어사 승리
        }   
        else{ //13광땡, 18광떙이 없다면
            score[score.indexOf(1500)] = 1 //암행어사는 1끗으로 취급됨
        }
    }
    maxScore = Math.max(...score)

    if (score.includes(99)){ //땡잡이가 있고
        if (maxScore !== 1000 && maxScore % 100 === 0){ //가장 높은 패가 9땡이라면 
            score[score.indexOf(99)] = 999 //땡잡이 승리
        }
        else { //땡이 없거나 땡보다 높은 패가 있다면
            score[score.indexOf(99)] = 0 //땡잡이는 망통으로 취급됨.
        }
    }
    maxScore = Math.max(...score)

    if (maxScore === 49){ //최댓값이 49 ( = 사구파토 ) 라면
        return null;
    }

    let winners = [];
    score.forEach((s, i) => {
        if (s === maxScore) {
            winners.push(userList[i]);
        }
    });

    console.log(score, winners)
    return winners//승자 출력
}

//컴퓨터의 점수 출력
function getComputerScore(user) {
    let computerScore = getCardScore(user.card[0], user.card[1]); //컴퓨터의 점수 구하기

    if (user.card[2] !== undefined){ //3번째카드가 있으면 가장 높은 점수를 할당
        computerScore = Math.max(getCardScore(user.card[0], user.card[1]), getCardScore(user.card[1], user.card[2]), getCardScore(user.card[0], user.card[2]))
    }

    return computerScore;
}

//카드 입력 시 족보 출력.
function getCardScore(card1, card2) {
    let temp = [card1, card2].sort((a, b) => a.score - b.score); //card1과 card2를 score의 크기에 따라 정렬 | a = card1, b = card2 를 의미하며 a.score - b.score가 음수라면 a가 b보다 먼저, 양수라면 b가 a보다 먼저 옴. => score값에 따라 오름차순 정렬
    card1 = temp[0];
    card2 = temp[1];

    if (card1.score === 4 && card2.score === 9){ //구사
        return 49
    }
    else if (card1.score === 3 && card1.isSpecial === true && card2.score === 7 && card2.isSpecial === true){ //땡잡이
        return 99
    }
    else if (card1.score === 4 && card1.isSpecial === true && card2.score === 7 && card2.isSpecial === true){ //암행어사
        return 1500
    }
    else if (card1.score === 3 && card1.isSpecial === true && card2.score === 8 && card2.isSpecial === true){ //38광땡
        return 3838
    }
    else if (card1.score === 1 && card1.isSpecial === true && card2.score === 8 && card2.isSpecial === true){ //18광땡
        return 2038
    }
    else if (card1.score === 1 && card1.isSpecial === true && card2.score === 3 && card2.isSpecial === true){ //13광땡
        return 2038
    }
    else if (card1.score === card2.score){ //1~10땡
        return card1.score * 100
    }
    else if (card1.score === 1 && card2.score === 2){ //알리 
        return 45
    }
    else if (card1.score === 1 && card2.score === 4){ //독사
        return 40
    }
    else if (card1.score === 1 && card2.score === 9){ //구삥
        return 35
    }
    else if (card1.score === 1 && card2.score === 10){ //장삥
        return 30
    }
    else if (card1.score === 4 && card2.score === 10){ //장사
        return 25
    }
    else if (card1.score === 4 && card2.score === 6){ //세륙
        return 20
    }
    else { // 0 ~ 9 끗
        return (card1.score + card2.score) % 10
    }
} 

// 컴퓨터 배팅 확률 객체화 키:"단계", 값:[call, half, die]
const attackBotBettingScore = { // 공격봇 분기 리스트
    "bestHighScore": [90, 10, 0],  
    "highScore": [85, 14, 1],  
    "middleHighScore": [75, 20, 5],
    "middleScore": [80, 15, 5],
    "middleLowScore": [85, 10, 5],
    "lowScore": [70, 25, 5],
    "bestLowScore": [60, 10, 30],
    "specialScore": [70, 10, 20],
    "defaultScore": [95, 5, 0]
};
const defenseBotBettingScore = { // 수비봇 분기 리스트
    "bestHighScore": [80, 20, 0],  
    "highScore": [58, 40, 2],  
    "middleHighScore": [70, 25, 5],
    "middleScore": [80, 15, 5],
    "middleLowScore": [60, 10, 30],
    "lowScore": [40, 5, 55],
    "bestLowScore": [10, 0, 90],
    "specialScore": [65, 5, 30],
    "defaultScore": [95, 5, 0]
};

//컴퓨터 손안의 패 -> 스코어 전환 함수
function computerHand(computerChoice) {
    const ranges = [ //객체
        { min: 0, max: 0, hand: "bestLowScore" },     // "망통"
        { min: 1, max: 4, hand: "lowScore" },         // "4끗, 3끗, 2끗, 1끗"
        { min: 5, max: 7, hand: "middleLowScore" },   // "7끗, 6끗, 5끗"
        { min: 8, max: 19, hand: "middleScore" },     // "9끗, 8끗"
        { min: 20, max: 699, hand: "middleHighScore" },// "알리, 독사, 구삥, 장삥, 장사, 세륙"
        { min: 700, max:2037 , hand: "highScore" },     // "장땡, 9땡, 8땡, 7땡"
        { min: 2038, max: 3038, hand: "bestHighScore" } // "삼팔광땡, 광땡"
    ];

    if ([49, 99, 1500].includes(computerChoice)) { // 특수패 우선 처리
        return "specialScore";
    }

    for (const range of ranges) { // 값에 따른 분기 조정
        if (computerChoice >= range.min && computerChoice <= range.max) {
            return range.hand;
        }
    }

    // if (round.round <= 0) { // 첫 배팅은 다이 불가능
    //     return "defaultScore";
    // }
}

//컴퓨터 받은 값으로 (call, half, die) 
function botBetting(call, half, user) { // 출력을 위해 user 추가가
    const random = Math.random() * 100;
    if (random < call) {
        callBetting(user);
        return;
    } else if (random < call + half) {
        halfBetting(user);
        return;
    } else {
        dieBetting(user);
        return;
    }
}

//컴퓨터 공격형 배팅 출력력
function attackBotJudg(user) {
    const computerChoice = getComputerScore(user) //이미 족보 판단은 완료 후 0 ~ max 값 반환
    const comDeck = computerHand(computerChoice);
    const [call, half] = attackBotBettingScore[comDeck]; //분기를 나눈 이유
    botBetting(call, half, user)
}
//컴퓨터 수비형형 배팅 출력
function defenseBotJudg(user) {
    const computerChoice = getComputerScore(user) //이미 족보 판단은 완료 후 0 ~ max값 반환
    const comDeck = computerHand(computerChoice);
    const [call, half] = defenseBotBettingScore[comDeck]; //분기를 나눈 이유
    botBetting(call, half, user)
}