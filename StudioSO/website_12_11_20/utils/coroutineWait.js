function wait(gen)
{
    var g = gen();
    function next()
    {
      var cur = g.next();
      if (cur.done)
      {
        return cur.value;
      }
      cur.value(next);
    }
    next();
}

function delay(time)
{
  return function(f)
  {
    setTimeout(f, time);
  }
}
