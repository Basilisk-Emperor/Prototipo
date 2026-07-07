import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

async function seedData() {
  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    console.log('Inserting book: Worm...');
    
    // Insert book
    const [bookResult] = await connection.execute(
      'INSERT INTO books (title, author, description, coverUrl) VALUES (?, ?, ?, ?)',
      [
        'Worm',
        'Wildbow',
        'Uma história épica sobre poderes, responsabilidade e as consequências de nossas escolhas. Acompanhe Taylor Hebert enquanto ela descobre seus poderes e enfrenta os desafios de um mundo cheio de super-heróis e super-vilões.',
        'https://parahumans.wordpress.com/wp-content/uploads/2013/10/Worm-Cover-2.png'
      ]
    );

    const bookId = bookResult.insertId;
    console.log(`Book inserted with ID: ${bookId}`);

    // Insert chapter
    const chapterContent = `Class ended in five minutes and all I could think was, an hour is too long for lunch.

Since the start of the semester, I had been looking forward to the part of Mr. Gladly's World Issues class where we'd start discussing capes. Now that it had finally arrived, I couldn't focus. I fidgeted, my pen moving from hand to hand, tapping, or absently drawing some figure in the corner of the page to join the other doodles. My eyes were restless too, darting from the clock above the door to Mr. Gladly and back to the clock. I wasn't picking up enough of his lesson to follow along. Twenty minutes to twelve; five minutes left before class ended.

He was animated, clearly excited about what he was talking about, and for once, the class was listening. He was the sort of teacher who tried to be friends with his students, the sort who went by "Mr. G" instead of Mr. Gladly. He liked to end class a little earlier than usual and chat with the popular kids, gave lots of group work so others could hang out with their friends in class, and had 'fun' assignments like mock trials.

He struck me as one of the 'popular' kids who had become a teacher. He probably thought he was everyone's favorite. I wondered how he'd react if he heard my opinion on the subject. Would it shatter his self image or would he shrug it off as an anomaly from the gloomy girl that never spoke up in class?

I glanced over my shoulder. Madison Clements sat two rows to my left and two seats back. She saw me looking and smirked, her eyes narrowing, and I lowered my eyes to my notebook. I tried to ignore the ugly, sour feeling that stewed in my stomach. I glanced up at the clock. Eleven-forty-three.

"Let me wrap up here," Mr. Gladly said, "Sorry, guys, but there is homework for the weekend. Think about capes and how they've impacted the world around you. Make a list if you want, but it's not mandatory. On Monday we'll break up into groups of four and see what group has the best list. I'll buy the winning group treats from the vending machine."

There were a series of cheers, followed by the classroom devolving into noisy chaos. The room was filled with sounds of binders snapping shut, textbooks and notebooks being slammed closed, chairs screeching on cheap tile and the dull roar of emerging conversation. A bunch of the more social members of the class gathered around Mr. Gladly to chat.

Me? I just put my books away and kept quiet. I'd written down almost nothing in the way of notes; there were collections of doodles spreading across the page and numbers in the margins where I'd counted down the minutes to lunch as if I was keeping track of the timer on a bomb.

Madison was talking with her friends. She was popular, but not gorgeous in the way the stereotypical popular girls on TV were. She was 'adorable', instead. Petite. She played up the image with sky blue pins in her shoulder length brown hair and a cutesy attitude. Madison wore a strapless top and denim skirt, which seemed absolutely moronic to me given the fact that it was still early enough in the spring that we could see our breath in the mornings.

I wasn't exactly in a position to criticize her. Boys liked her and she had friends, while the same was hardly true for me. The only feminine feature I had going for me was my dark curly hair, which I'd grown long. The clothes I wore didn't show skin, and I didn't deck myself out in bright colors like a bird showing off its plumage.

Guys liked her, I think, because she was appealing without being intimidating.

If they only knew.

The bell rang with a lilting ding-dong, and I was the first one out the door. I didn't run, but I moved at a decent clip as I headed up the stairwell to the third floor and made my way to the girl's washroom.`;

    const [chapterResult] = await connection.execute(
      'INSERT INTO chapters (bookId, chapterNumber, title, originalContent) VALUES (?, ?, ?, ?)',
      [
        bookId,
        1,
        'Gestation 1.1',
        chapterContent
      ]
    );

    const chapterId = chapterResult.insertId;
    console.log(`Chapter inserted with ID: ${chapterId}`);

    // Insert official PT-BR translation
    const officialTranslation = `A aula terminaria em cinco minutos e tudo que eu conseguia pensar era: uma hora é muito tempo para almoço.

Desde o início do semestre, eu estava ansioso pela parte da aula de Assuntos Mundiais do Sr. Gladly onde começaríamos a discutir super-heróis. Agora que finalmente havia chegado, eu não conseguia me concentrar. Eu me mexia, minha caneta se movendo de uma mão para a outra, batendo, ou desenhando absurdamente alguma figura no canto da página para se juntar aos outros rabiscos. Meus olhos também estavam inquietos, saltando do relógio acima da porta para o Sr. Gladly e voltando para o relógio. Eu não estava captando o suficiente de sua lição para acompanhar. Vinte minutos para o meio-dia; cinco minutos antes da aula terminar.

Ele estava animado, claramente entusiasmado com o que estava falando, e pela primeira vez, a classe estava ouvindo. Ele era o tipo de professor que tentava ser amigo de seus alunos, o tipo que preferia ser chamado de "Sr. G" em vez de Sr. Gladly. Ele gostava de terminar a aula um pouco mais cedo do que o normal e conversar com os alunos populares, dava muito trabalho em grupo para que outros pudessem ficar com seus amigos na aula, e tinha atribuições 'divertidas' como julgamentos simulados.

Ele me parecia ser um dos alunos 'populares' que se tornou professor. Ele provavelmente pensava que era o favorito de todos. Eu me perguntava como ele reagiria se ouvisse minha opinião sobre o assunto. Isso destruiria sua auto-imagem ou ele simplesmente descartaria como uma anomalia da garota sombria que nunca falava na aula?

Olhei por sobre meu ombro. Madison Clements estava sentada duas fileiras à minha esquerda e dois assentos para trás. Ela me viu olhando e fez uma careta, seus olhos se estreitando, e eu baixei meus olhos para meu caderno. Tentei ignorar o sentimento feio e azedo que fervia em meu estômago. Olhei para o relógio. Onze e quarenta e três.

"Deixe-me encerrar aqui," disse o Sr. Gladly, "Desculpem, pessoal, mas há sim dever de casa para o fim de semana. Pensem sobre super-heróis e como eles impactaram o mundo ao seu redor. Façam uma lista se quiserem, mas não é obrigatório. Na segunda-feira nos dividiremos em grupos de quatro e veremos qual grupo tem a melhor lista. Comprarei guloseimas da máquina de venda automática para o grupo vencedor."

Houve uma série de aplausos, seguida pela sala de aula se tornando um caos barulhento. A sala estava cheia de sons de pastas se fechando, livros e cadernos sendo batidos, cadeiras rangendo no chão de azulejo barato e o rugido surdo da conversa emergente. Um monte dos membros mais sociais da classe se reuniram ao redor do Sr. Gladly para conversar.

Eu? Apenas guardei meus livros e fiquei quieta. Eu havia anotado quase nada em termos de notas; havia coleções de rabiscos se espalhando pela página e números nas margens onde eu tinha contado os minutos até o almoço como se estivesse acompanhando o cronômetro de uma bomba.

Madison estava conversando com suas amigas. Ela era popular, mas não linda da forma que as garotas populares estereotipadas na TV eram. Ela era 'adorável', em vez disso. Miúda. Ela reforçava a imagem com alfinetes azul-céu em seu cabelo castanho de comprimento médio e uma atitude fofa. Madison usava um top sem alças e uma saia jeans, o que me parecia absolutamente idiota dado o fato de que ainda era cedo o suficiente na primavera para vermos nosso hálito pela manhã.

Eu não estava exatamente em posição de criticá-la. Os garotos gostavam dela e ela tinha amigos, enquanto o mesmo dificilmente era verdade para mim. O único traço feminino que eu tinha a meu favor era meu cabelo preto e encaracolado, que eu havia deixado crescer. As roupas que usava não mostravam pele, e eu não me enfeitava com cores brilhantes como um pássaro exibindo sua plumagem.

Os garotos gostavam dela, acho, porque ela era atraente sem ser intimidadora.

Se eles soubessem.

A campainha tocou com um som melodioso ding-dong, e eu fui a primeira a sair pela porta. Eu não corri, mas me movi em um ritmo decente enquanto subia a escada para o terceiro andar e me dirigia para o banheiro das meninas.`;

    await connection.execute(
      'INSERT INTO translations (chapterId, language, translationType, content) VALUES (?, ?, ?, ?)',
      [
        chapterId,
        'pt-BR',
        'official',
        officialTranslation
      ]
    );

    console.log('Official PT-BR translation inserted');

    console.log('\nData seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seedData();
