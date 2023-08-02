let mine_num = 40;      // 지뢰의 개수
let mine_correct = [];        // 지뢰의 위치
let mine_choose = [];        // 선택한 지뢰의 위치
let target = [];        // 0 자리 클릭 시 오픈할 모든 위치 저장
let open_done = [];      // 오픈된 위치
let time = 0;       // 경과 시간
let timer;

document.oncontextmenu = function (e) {return false;}       // 오른쪽 마우스 클릭 시 나타나는 메뉴창 제거
make_board();       // 12x16 board 만들기 
mine_correct = initiate_board(0);        // mine_correct 배열 초기화
mine_choose = initiate_board(false);        // mine_choose 배열 초기화
open_done = initiate_board(false);       // open_done 배열 초기화
create_Q();         // mine_correct에 40개의 지뢰 위치 랜덤 선택하여 저장
count_mine();       // 각 위치별로 주변의 mine 개수 세서 mine_correct에 저장
document.getElementById('mine').value = mine_num;       // 남은 지뢰 개수 표시
const blocks = document.querySelectorAll('td');      // 모든 block에 대해 클릭시 동작 추가
blocks.forEach((block) => {
    block.addEventListener('click', (event)=>open(event));
    block.addEventListener('contextmenu', (event)=>flag_mark(event));
});
document.getElementById('time').value = "00:00";
timer = setInterval(time_flies, 1000);

// 12x16 board 만들기 
function make_board() {
    let table = '<table>';
    for(let i = 0; i < 12; i++) {
        table += '<tr>';
        for(let i = 0; i < 16; i++)
            table += '<td></td>';
        table += '</tr>';
    }
    table += '</table>';
    document.getElementById('board').innerHTML = table;
}
// 12x16 배열 element로 초기화
function initiate_board(element) {
    let arr = [];
    for(let i = 0; i < 12; i++) {
        let inner = Array.from({length: 16}, ()=>element);
        arr.push(inner);
    }
    return arr;
}
// 40개의 지뢰 위치 랜덤 선택하여 mine_correct 배열에 저장
function create_Q() {
    let count = 0;
    while(count < 40) {
        let row = Math.floor(Math.random()*12);
        let col = Math.floor(Math.random()*16);
        if(!mine_correct[row][col]) {
            mine_correct[row][col] = -1;        // -1: 지뢰가 있다는 뜻
            count++;
        }   
    }
}
// 각 위치별로 주변의 지뢰 개수를 세어 저장
function count_mine() {
    for(let i = 0; i < 12; i++) {
        for(let j = 0; j < 16; j++) {
            if(mine_correct[i][j] == -1)    continue;
            let row = [-1,-1,-1,0,0,1,1,1];
            let col = [-1,0,1,-1,1,-1,0,1];
            for(let k = 0; k < 8; k++) {
                let r = i + row[k];
                let c = j + col[k];
                if(0<=r && r<12 && 0<=c && c<16) {
                    if(mine_correct[r][c] == -1)
                        mine_correct[i][j]++;
                }
            }
        }
    }
}
// 좌클릭 시 open
function open(event) {
    let table = document.querySelector('table');
    let row = event.target.parentNode.rowIndex;
    let col = event.target.cellIndex;
    if(mine_correct[row][col] == -1)
        reveal_mine();
    else {
        dfs(row, col);      // 오픈할 모든 위치 탐색 후 target 배열에 저장
        openAll(table);      // target에 들어있는 모든 위치 오픈 함수
    } 
}
// 0 자리 클릭 시 오픈할 모든 위치 탐색
function dfs(row, col) {
    target.push([row, col]);
    open_done[row][col] = true;
    if(mine_correct[row][col] > 0)  return;
    let r = [-1,-1,-1,0,0,1,1,1];
    let c = [-1,0,1,-1,1,-1,0,1];
    for(let i = 0; i < 8; i++) {
        let rr = row + r[i];
        let cc = col + c[i];
        if(0<=rr && rr<12 && 0<=cc && cc<16) {
            if(!open_done[rr][cc] && mine_correct[rr][cc]!=-1)
                dfs(rr, cc);
        }
    }
}
// target에 들어있는 모든 위치 오픈 함수
function openAll(table) {
    for(let i = 0; i < target.length; i++) {
        let row = target[i][0];
        let col = target[i][1];
        if(mine_choose[row][col]) {     // 지뢰로 표시했던 위치를 오픈하게 될 경우 -> 오픈하기
            const flag = document.getElementById(row + " " + col);
            table.rows[row].cells[col].removeChild(flag);
            mine_choose[row][col] = false;
            document.getElementById('mine').value = ++mine_num;     // 남은 지뢰개수 표시
        }
        table.rows[row].cells[col].innerText = mine_correct[row][col];
        if(mine_correct[row][col] == 0)
            table.rows[row].cells[col].style.color = "#A61F69";
        else
            table.rows[row].cells[col].style.color = "#1A5D1A";
    }
    target = [];
}
// 우클릭 시 지뢰 표시 또는 표시 취소
function flag_mark(event) {
    let table = document.querySelector('table');
    let row = event.target.parentNode.rowIndex;
    let col = event.target.cellIndex;
    if(mine_choose[row][col]) {     // 이미 표시되어 있을 경우 -> 취소
        const flag = document.getElementById(row + " " + col);
        table.rows[row].cells[col].removeChild(flag);
        mine_choose[row][col] = false;
        document.getElementById('mine').value = ++mine_num;     // 남은 지뢰개수 표시
    } else {    // 지뢰 표시하기
        if(mine_num > 0 && table.rows[row].cells[col].innerText == "") {
            const flag = document.createElement("img");
            flag.id = row + " " + col;
            flag.src = "bomb.svg";
            flag.style.width = 23 + "px";
            flag.style.height = 23 + "px";
            flag.addEventListener('click', ()=>{open(event);});
            flag.addEventListener('contextmenu', ()=>flag_mark(event));
            table.rows[row].cells[col].appendChild(flag);
            // 남은 지뢰 개수 표시
            document.getElementById('mine').value = --mine_num;      
            mine_choose[row][col] = true;
        }
        if(mine_num == 0) {     // 모든 지뢰를 전부 표시했을 경우: 정답 확인
            if(answer_correct()) {
                clearInterval(timer);
                reveal_all();       // 모든 보드판 공개
                alert("Well done!\nYou took " + time + " seconds to complete.");
            }
            else
                alert("Wrong answer... Try again!");
        }
    }
}
// 정답 확인
function answer_correct() {
    for(let i = 0; i < 12; i++) {
        for(let j = 0; j < 16; j++) {
            if(mine_choose[i][j]) {
                if(mine_correct[i][j] != -1)
                    return false;
            }
        }
    }
    return true;
}
// 지뢰 클릭시 모든 지뢰 공개 후 game over
function reveal_mine() {
    clearInterval(timer);
    let table = document.querySelector('table');
    // 표시했던 지뢰 먼저 취소
    for(let i = 0; i < 12; i++) {
        for(let j = 0; j < 16; j++) {
            if(mine_choose[i][j]) {     // 이미 표시되어 있을 경우 -> 취소
                const flag = document.getElementById(i + " " + j);
                table.rows[i].cells[j].removeChild(flag);
                mine_choose[i][j] = false;
            }
        }
    }
    document.getElementById('mine').value = 40;
    // 정답인 지뢰 위치 표시
    for(let i = 0; i < 12; i++) {
        for(let j = 0; j < 16; j++) {
            if(mine_correct[i][j] != -1)        // 지뢰 아닌 곳 표시
            {
                table.rows[i].cells[j].innerText = mine_correct[i][j];
                if(mine_correct[i][j] == 0)
                    table.rows[i].cells[j].style.color = "#A61F69";
                else
                    table.rows[i].cells[j].style.color = "#1A5D1A";
            } else {        // 지뢰 위치 표시
                const flag = document.createElement("img");
                flag.id = i + " " + j;
                flag.src = "bomb.svg";
                flag.style.width = 23 + "px";
                flag.style.height = 23 + "px";
                table.rows[i].cells[j].appendChild(flag);
                mine_choose[i][j] = true;
            }
        }
    }
    alert("Boom! Game over");
}
// 정답일 경우 모든 보드판 공개
function reveal_all() {
    let table = document.querySelector('table');
    for(let i = 0; i < 12; i++) {
        for(let j = 0; j < 16; j++) {
            if(mine_correct[i][j] != -1) {
                table.rows[i].cells[j].innerText = mine_correct[i][j];
                if(mine_correct[i][j] == 0)
                    table.rows[i].cells[j].style.color = "#A61F69";
                else
                    table.rows[i].cells[j].style.color = "#1A5D1A";
            }
        }
    }
}
// 시간 흐르는 함수
function time_flies() {
    time++;
    let minute = String(Math.floor(time/60)).padStart(2, "0");
    let second = String(Math.floor(time%60)).padStart(2, "0");
    document.getElementById('time').value = minute + ":" + second;
}